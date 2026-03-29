"""
Centralized yt-dlp option construction and cookie handling.

The cookies source file (YTDLP_COOKIES_FILE) is treated as read-only input —
it may live on a read-only Docker bind-mount.  Before passing it to yt-dlp,
we copy it to a writable temp file so that yt-dlp's cookie-jar save-back in
YoutubeDL.__exit__ writes to a writable path and does NOT raise OSError.
This ensures the real error (e.g. DownloadError from AUTH_REQUIRED) is never
masked by a filesystem exception.
"""
import logging
import os
import shutil
import tempfile
from contextlib import contextmanager
from typing import Any, Dict, Generator, Optional

from app.core.config import settings
from app.core.errors import AnalysisError, ErrorCode

logger = logging.getLogger(__name__)


def _copy_cookies_to_temp() -> Optional[str]:
    """
    Copy the configured cookies file to a new writable temp file inside
    TEMP_DOWNLOAD_ROOT (guaranteed writable in Docker).

    Returns the temp file path, or None if YTDLP_COOKIES_FILE is not set or
    the source file does not exist.

    Raises AnalysisError(INTERNAL_ERROR) if the copy fails (e.g.
    TEMP_DOWNLOAD_ROOT is not writable).
    """
    source = settings.YTDLP_COOKIES_FILE
    if not source:
        return None

    if not os.path.isfile(source):
        logger.warning(
            "YTDLP_COOKIES_FILE=%r does not exist — yt-dlp will run without cookies",
            source,
        )
        return None

    temp_dir = settings.TEMP_DOWNLOAD_ROOT
    try:
        os.makedirs(temp_dir, exist_ok=True)
        fd, tmp_path = tempfile.mkstemp(
            suffix=".txt", prefix="yt_cookies_", dir=temp_dir
        )
        os.close(fd)
        shutil.copy2(source, tmp_path)
        logger.debug(
            "yt-dlp cookies: copied %s → %s (writable temp)", source, tmp_path
        )
        return tmp_path
    except OSError as exc:
        logger.error("Failed to create writable cookie temp copy: %s", exc)
        raise AnalysisError(
            ErrorCode.INTERNAL_ERROR,
            (
                "Could not create a writable copy of the cookies file. "
                "Check that TEMP_DOWNLOAD_ROOT is writable inside the container."
            ),
            {"source": source, "temp_dir": temp_dir, "detail": str(exc)},
        ) from exc


@contextmanager
def writable_cookie_file() -> Generator[Optional[str], None, None]:
    """
    Context manager that yields a writable temp copy of the configured
    cookies file, or None if no cookie file is configured.

    The temp file is deleted on exit regardless of outcome.  Using a temp
    copy ensures that yt-dlp's cookie-jar save-back in YoutubeDL.__exit__
    writes to a writable path, so the real error (e.g. DownloadError from
    AUTH_REQUIRED) is never masked by an OSError.

    Usage::

        with writable_cookie_file() as cookie_path:
            opts = {...}
            if cookie_path:
                opts["cookiefile"] = cookie_path
            with yt_dlp.YoutubeDL(opts) as ydl:
                ...
    """
    tmp_path: Optional[str] = None
    try:
        tmp_path = _copy_cookies_to_temp()  # may raise AnalysisError
        yield tmp_path
    finally:
        if tmp_path:
            try:
                os.unlink(tmp_path)
                logger.debug("yt-dlp cookies: removed temp file %s", tmp_path)
            except OSError:
                pass  # best-effort cleanup


def build_base_opts() -> Dict[str, Any]:
    """
    Return shared yt-dlp base options used by both analysis and download flows.
    Does not include skip_download or cookiefile — callers add those as needed.
    Cookie injection must be done via writable_cookie_file().
    """
    opts: Dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
    }
    if settings.FFMPEG_PATH:
        opts["ffmpeg_location"] = settings.FFMPEG_PATH
    if settings.YTDLP_SKIP_YOUTUBETAB_AUTHCHECK:
        # Suppress the youtube:tab "Playlists that require authentication may not
        # extract correctly" pre-check gate.  Safe for public playlists/channels.
        # Controlled by YTDLP_SKIP_YOUTUBETAB_AUTHCHECK (default: True).
        opts["extractor_args"] = {"youtubetab": {"skip": ["authcheck"]}}
    return opts
