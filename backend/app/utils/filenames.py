import re
import unicodedata


_UNSAFE = re.compile(r'[<>:"/\\|?*\x00-\x1f]')
_MULTI_SPACE = re.compile(r'\s+')
_LEADING_TRAILING = re.compile(r'^[\s._-]+|[\s._-]+$')


def sanitize_filename(name: str, max_length: int = 200) -> str:
    """Return a filesystem-safe filename (no extension)."""
    # Normalize unicode
    name = unicodedata.normalize("NFKC", name)
    # Remove unsafe chars
    name = _UNSAFE.sub("_", name)
    # Collapse whitespace
    name = _MULTI_SPACE.sub(" ", name)
    # Strip leading/trailing unsafe chars
    name = _LEADING_TRAILING.sub("", name)
    # Truncate
    return name[:max_length] or "download"


def sanitize_dirname(name: str) -> str:
    """Return a filesystem-safe directory name."""
    return sanitize_filename(name, max_length=100)
