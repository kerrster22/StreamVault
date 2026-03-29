"""
Structured error types for StreamVault API.

AnalysisError is raised by the analysis service and caught by the route
handler, which converts it into a structured JSON response with an
appropriate HTTP status code.
"""
from enum import Enum
from typing import Any, Dict, Optional


class ErrorCode(str, Enum):
    INVALID_URL = "INVALID_URL"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    EXTRACTION_FAILED = "EXTRACTION_FAILED"
    AUTH_REQUIRED = "AUTH_REQUIRED"
    RATE_LIMITED = "RATE_LIMITED"
    UNSUPPORTED_SOURCE = "UNSUPPORTED_SOURCE"
    INTERNAL_ERROR = "INTERNAL_ERROR"


# HTTP status code for each error code
HTTP_STATUS: Dict[ErrorCode, int] = {
    ErrorCode.INVALID_URL: 400,
    ErrorCode.VALIDATION_ERROR: 422,
    ErrorCode.EXTRACTION_FAILED: 422,
    ErrorCode.AUTH_REQUIRED: 401,
    ErrorCode.RATE_LIMITED: 429,
    ErrorCode.UNSUPPORTED_SOURCE: 422,
    ErrorCode.INTERNAL_ERROR: 500,
}

SUGGESTED_ACTIONS: Dict[ErrorCode, str] = {
    ErrorCode.AUTH_REQUIRED: (
        "YouTube is blocking this request. "
        "For videos or private playlists: add a cookies.txt file, set YTDLP_COOKIES_FILE "
        "in your Docker config, and export cookies from a logged-in browser session. "
        "For public playlists blocked by YouTube's auth pre-check: ensure "
        "YTDLP_SKIP_YOUTUBETAB_AUTHCHECK=true in your config (this is the default)."
    ),
    ErrorCode.RATE_LIMITED: (
        "Wait a moment and try again. Using a cookies file may bypass the rate limit."
    ),
    ErrorCode.UNSUPPORTED_SOURCE: (
        "Check that the URL points to a supported platform and that the content is public."
    ),
    ErrorCode.INVALID_URL: (
        "Check that the URL is valid and publicly accessible."
    ),
    ErrorCode.EXTRACTION_FAILED: (
        "The content may be private, deleted, or region-locked. Check the URL and try again."
    ),
}


class AnalysisError(Exception):
    def __init__(
        self,
        code: ErrorCode,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.details: Dict[str, Any] = details or {}

    @property
    def http_status(self) -> int:
        return HTTP_STATUS.get(self.code, 500)

    def to_response(self) -> Dict[str, Any]:
        err: Dict[str, Any] = {
            "code": self.code,
            "message": self.message,
            "details": self.details,
        }
        action = SUGGESTED_ACTIONS.get(self.code)
        if action:
            err["suggestedAction"] = action
        return {"error": err}
