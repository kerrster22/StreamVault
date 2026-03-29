import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.downloads import DownloadRequest, DownloadResponse
from app.services.download_service import create_and_enqueue

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/download", response_model=DownloadResponse)
def start_download(request: DownloadRequest, session: Session = Depends(get_session)):
    """Queue a new download job."""
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    try:
        return create_and_enqueue(request, session)
    except Exception as exc:
        logger.exception("Failed to create download job")
        raise HTTPException(status_code=500, detail="Failed to queue download")
