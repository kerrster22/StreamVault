import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.core.errors import AnalysisError, ErrorCode
from app.schemas.analyze import AnalyzeRequest
from app.services.analysis_service import analyze_url

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze")
def analyze(request: AnalyzeRequest):
    """
    Analyze a URL and return normalised metadata.
    Returns VideoSource | PlaylistSource | ChannelSource.

    Error responses always carry a structured body:
      { "error": { "code": "...", "message": "...", "details": {...}, "suggestedAction": "..." } }
    """
    url = request.url.strip()
    if not url:
        return JSONResponse(
            status_code=400,
            content=AnalysisError(
                ErrorCode.INVALID_URL,
                "URL is required.",
            ).to_response(),
        )

    try:
        return analyze_url(url)
    except AnalysisError as exc:
        logger.warning("Analysis error for %s: [%s] %s", url, exc.code, exc.message)
        return JSONResponse(status_code=exc.http_status, content=exc.to_response())
    except Exception as exc:
        logger.exception("Unexpected error during analysis of %s", url)
        return JSONResponse(
            status_code=500,
            content=AnalysisError(
                ErrorCode.INTERNAL_ERROR,
                "An unexpected error occurred. Check server logs for details.",
            ).to_response(),
        )
