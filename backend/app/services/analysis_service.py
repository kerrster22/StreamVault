"""
Analysis service — wraps yt-dlp extract_info in non-download mode and
normalises the result into the schema shapes the frontend expects.
"""
import logging
from typing import Any, Dict, List, Optional, Union

import yt_dlp
import yt_dlp.utils

from app.core.config import settings
from app.core.errors import AnalysisError, ErrorCode
from app.utils.ytdlp import build_base_opts, writable_cookie_file
from app.schemas.analyze import (
    ChannelSource,
    PlaylistSource,
    VideoEntry,
    VideoFormat,
    VideoSource,
)

logger = logging.getLogger(__name__)

_CHANNEL_URL_PATTERNS = ("/@", "/channel/", "/user/", "/c/")
_CHANNEL_BASENAMES = {"videos", "shorts", "streams", "playlists", "featured", "releases"}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def analyze_url(url: str) -> Union[VideoSource, PlaylistSource, ChannelSource]:
    """Extract metadata for a URL and return a normalised source object."""
    info = _extract_flat(url)
    source_type = _detect_type(url, info)

    if source_type == "video":
        # Re-fetch without extract_flat so we get the formats list
        info = _extract_full(url)
        return _build_video(info)
    elif source_type == "channel":
        return _build_channel(url, info)
    else:
        return _build_playlist(info)


# ---------------------------------------------------------------------------
# Extraction helpers
# ---------------------------------------------------------------------------

def _base_opts() -> dict:
    opts = build_base_opts()
    opts["skip_download"] = True
    # NOTE: ignoreerrors is intentionally NOT set here.
    # With ignoreerrors=True, yt-dlp silently swallows auth/bot errors and
    # returns None, losing all diagnostic information. We catch
    # yt_dlp.utils.DownloadError explicitly and classify it below.
    return opts


def _extract_flat(url: str) -> Dict[str, Any]:
    """Fast extraction — entries are returned as stubs (no per-entry network calls)."""
    opts = _base_opts()
    opts["extract_flat"] = "in_playlist"

    try:
        with writable_cookie_file() as cookie_path:
            if cookie_path:
                opts["cookiefile"] = cookie_path
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=False)
                if info is None:
                    raise AnalysisError(
                        ErrorCode.EXTRACTION_FAILED,
                        "yt-dlp returned no data for this URL.",
                        {"url": url},
                    )
                return ydl.sanitize_info(info)
    except AnalysisError:
        raise
    except yt_dlp.utils.DownloadError as exc:
        raise _classify_error(str(exc), url) from exc
    except OSError as exc:
        logger.error("Filesystem error during yt-dlp extraction of %s: %s", url, exc)
        raise AnalysisError(
            ErrorCode.INTERNAL_ERROR,
            "A filesystem error occurred during extraction. Check container volume permissions.",
            {"url": url, "detail": str(exc)},
        ) from exc


def _extract_full(url: str) -> Dict[str, Any]:
    """Full extraction including formats list (single video only)."""
    opts = _base_opts()

    try:
        with writable_cookie_file() as cookie_path:
            if cookie_path:
                opts["cookiefile"] = cookie_path
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=False)
                if info is None:
                    raise AnalysisError(
                        ErrorCode.EXTRACTION_FAILED,
                        "yt-dlp returned no data for this URL.",
                        {"url": url},
                    )
                return ydl.sanitize_info(info)
    except AnalysisError:
        raise
    except yt_dlp.utils.DownloadError as exc:
        raise _classify_error(str(exc), url) from exc
    except OSError as exc:
        logger.error("Filesystem error during yt-dlp extraction of %s: %s", url, exc)
        raise AnalysisError(
            ErrorCode.INTERNAL_ERROR,
            "A filesystem error occurred during extraction. Check container volume permissions.",
            {"url": url, "detail": str(exc)},
        ) from exc


# ---------------------------------------------------------------------------
# Error classification
# ---------------------------------------------------------------------------

# Ordered: more specific patterns first.
_AUTH_PATTERNS = (
    "sign in to confirm",
    "use --cookies",
    "cookies for the authentication",
    "this video is only available for",
    "this video requires payment",
    "members-only",
    "age-restricted",
    "confirm your age",
    "login required",
    "require authentication",        # covers both "require" and "requires" forms
    "requires authentication",
    "authentication may not extract", # youtube:tab authcheck specific
    "not a bot",
)

_RATE_LIMIT_PATTERNS = (
    "http error 429",
    "too many requests",
    "rate limit",
)

_UNSUPPORTED_PATTERNS = (
    "unsupported url",
    "no suitable",
    "is not supported",
)

_UNAVAILABLE_PATTERNS = (
    "video unavailable",
    "private video",
    "this video has been removed",
    "this video is not available",
    "has been deleted",
)


def _classify_error(message: str, url: str) -> AnalysisError:
    """Map a raw yt-dlp DownloadError message to a typed AnalysisError."""
    lower = message.lower()
    details: Dict[str, Any] = {"url": url}

    for pat in _AUTH_PATTERNS:
        if pat in lower:
            return AnalysisError(ErrorCode.AUTH_REQUIRED, (
                "Authentication is required to access this content. "
                "YouTube is blocking the request — a valid cookies file is needed."
            ), details)

    for pat in _RATE_LIMIT_PATTERNS:
        if pat in lower:
            return AnalysisError(ErrorCode.RATE_LIMITED, (
                "The request was rate-limited or blocked by the provider."
            ), details)

    for pat in _UNSUPPORTED_PATTERNS:
        if pat in lower:
            return AnalysisError(ErrorCode.UNSUPPORTED_SOURCE, (
                "This URL is not supported by yt-dlp."
            ), details)

    for pat in _UNAVAILABLE_PATTERNS:
        if pat in lower:
            return AnalysisError(ErrorCode.EXTRACTION_FAILED, (
                "This content is unavailable (private, deleted, or region-locked)."
            ), details)

    # Generic — include a sanitised excerpt so server logs stay readable.
    excerpt = message[:200].strip()
    return AnalysisError(
        ErrorCode.EXTRACTION_FAILED,
        "yt-dlp could not extract info for this URL.",
        {**details, "ytdlpMessage": excerpt},
    )


# ---------------------------------------------------------------------------
# Type detection
# ---------------------------------------------------------------------------

def _detect_type(url: str, info: Dict[str, Any]) -> str:
    _type = info.get("_type", "video")

    if _type == "video":
        return "video"

    if _type in ("playlist", "multi_video"):
        if any(p in url for p in _CHANNEL_URL_PATTERNS):
            return "channel"
        basename = info.get("webpage_url_basename", "")
        if basename in _CHANNEL_BASENAMES:
            return "channel"
        # Has channel_id but no playlist_id prefix → channel
        if info.get("channel_id") and not (info.get("id") or "").startswith("PL"):
            return "channel"
        return "playlist"

    return "video"


# ---------------------------------------------------------------------------
# Source builders
# ---------------------------------------------------------------------------

def _build_video(info: Dict[str, Any]) -> VideoSource:
    return VideoSource(
        type="video",
        id=str(info.get("id", "")),
        title=info.get("title") or "Untitled",
        thumbnail=_best_thumbnail(info),
        uploader=info.get("uploader") or info.get("channel") or "",
        duration=int(info.get("duration") or 0),
        publishDate=info.get("upload_date") or "",
        description=info.get("description") or "",
        formats=_normalize_formats(info.get("formats") or []),
    )


def _build_playlist(info: Dict[str, Any]) -> PlaylistSource:
    entries_raw = info.get("entries") or []
    entries = _normalize_entries(entries_raw)
    return PlaylistSource(
        type="playlist",
        id=str(info.get("id", "")),
        title=info.get("title") or "Untitled Playlist",
        thumbnail=_best_thumbnail(info) or (entries[0].thumbnail if entries else ""),
        uploader=info.get("uploader") or info.get("channel") or "",
        entryCount=info.get("playlist_count") or len(entries_raw),
        entries=entries[: settings.MAX_ANALYZE_ENTRIES_PREVIEW],
    )


def _build_channel(url: str, info: Dict[str, Any]) -> ChannelSource:
    entries_raw = info.get("entries") or []
    entries = _normalize_entries(entries_raw)
    return ChannelSource(
        type="channel",
        id=str(info.get("channel_id") or info.get("id", "")),
        title=info.get("channel") or info.get("title") or "Untitled Channel",
        thumbnail=_best_thumbnail(info),
        banner="",
        uploader=info.get("uploader") or info.get("channel") or "",
        subscriberCount=_fmt_subscribers(info.get("channel_follower_count")),
        entryCount=info.get("playlist_count") or len(entries_raw),
        entries=entries[: settings.MAX_ANALYZE_ENTRIES_PREVIEW],
        playlists=None,
    )


# ---------------------------------------------------------------------------
# Normalisation helpers
# ---------------------------------------------------------------------------

def _normalize_entries(raw: List[Any]) -> List[VideoEntry]:
    result = []
    for e in raw:
        if not isinstance(e, dict):
            continue
        if e.get("availability") in ("private", "premium_only"):
            continue
        result.append(VideoEntry(
            id=str(e.get("id", "")),
            title=e.get("title") or "Untitled",
            thumbnail=_best_thumbnail(e),
            duration=int(e.get("duration") or 0),
            publishDate=e.get("upload_date"),
        ))
    return result


def _normalize_formats(formats: List[Dict]) -> List[VideoFormat]:
    """
    Return a clean deduplicated list:
    - Progressive (video+audio) formats, deduped by height
    - DASH video-only formats if no progressive ones exist
    - One "Audio Only" entry at the end
    """
    result: List[VideoFormat] = []
    seen_heights: set = set()

    # Combined (progressive) streams
    combined = [
        f for f in formats
        if f.get("vcodec", "none") != "none" and f.get("acodec", "none") != "none"
    ]
    combined.sort(key=lambda x: x.get("height") or 0, reverse=True)

    for fmt in combined:
        h = fmt.get("height") or 0
        if h in seen_heights:
            continue
        seen_heights.add(h)
        label = f"{h}p" if h else (fmt.get("format_note") or fmt.get("format", ""))
        result.append(VideoFormat(
            format_id=fmt.get("format_id", ""),
            label=label,
            ext=fmt.get("ext", "mp4"),
            resolution=f"{fmt.get('width', '?')}x{h}",
            filesize=int(fmt.get("filesize") or fmt.get("filesize_approx") or 0),
            audio=True,
            video=True,
        ))

    # DASH video-only streams (no combined formats found)
    if not result:
        video_only = [
            f for f in formats
            if f.get("vcodec", "none") != "none" and f.get("acodec", "none") == "none"
        ]
        video_only.sort(key=lambda x: x.get("height") or 0, reverse=True)
        for fmt in video_only:
            h = fmt.get("height") or 0
            if h in seen_heights:
                continue
            seen_heights.add(h)
            label = f"{h}p" if h else fmt.get("format_note", "")
            result.append(VideoFormat(
                format_id=fmt.get("format_id", ""),
                label=label,
                ext=fmt.get("ext", "mp4"),
                resolution=f"{fmt.get('width', '?')}x{h}",
                filesize=int(fmt.get("filesize") or fmt.get("filesize_approx") or 0),
                audio=False,
                video=True,
            ))

    # Audio-only option (always shown)
    audio_fmts = [
        f for f in formats
        if f.get("vcodec", "none") == "none" and f.get("acodec", "none") != "none"
    ]
    if audio_fmts:
        best = max(audio_fmts, key=lambda x: x.get("abr") or x.get("tbr") or 0)
        result.append(VideoFormat(
            format_id="bestaudio",
            label="Audio Only",
            ext=best.get("ext", "m4a"),
            resolution="audio",
            filesize=int(best.get("filesize") or best.get("filesize_approx") or 0),
            audio=True,
            video=False,
        ))

    if not result:
        result.append(VideoFormat(
            format_id="best",
            label="Best Available",
            ext="mp4",
            resolution="unknown",
            filesize=0,
            audio=True,
            video=True,
        ))

    return result


def _best_thumbnail(info: Dict[str, Any]) -> str:
    if info.get("thumbnail"):
        return info["thumbnail"]
    thumbnails = info.get("thumbnails") or []
    if thumbnails:
        return thumbnails[-1].get("url", "")
    return ""


def _fmt_subscribers(count: Optional[int]) -> Optional[str]:
    if count is None:
        return None
    if count >= 1_000_000:
        return f"{count / 1_000_000:.1f}M"
    if count >= 1_000:
        return f"{count / 1_000:.1f}K"
    return str(count)
