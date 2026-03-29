import os
from pathlib import Path

from app.core.config import settings
from app.utils.filenames import sanitize_dirname


def media_root() -> Path:
    return Path(settings.MEDIA_ROOT)


def temp_root() -> Path:
    p = Path(settings.TEMP_DOWNLOAD_ROOT)
    p.mkdir(parents=True, exist_ok=True)
    return p


def output_dir_for(source_type: str, source_name: str = "") -> Path:
    """Return (and create) the output directory for a given source type."""
    base = media_root()
    if source_type == "channel" and source_name:
        path = base / "Channels" / sanitize_dirname(source_name)
    elif source_type == "playlist" and source_name:
        path = base / "Playlists" / sanitize_dirname(source_name)
    else:
        path = base / "Single Videos"
    path.mkdir(parents=True, exist_ok=True)
    return path


def is_within_media_root(filepath: str) -> bool:
    """Prevent path traversal attacks."""
    root = media_root().resolve()
    target = Path(filepath).resolve()
    try:
        target.relative_to(root)
        return True
    except ValueError:
        return False
