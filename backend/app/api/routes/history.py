from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.download_job import DownloadJob
from app.schemas.library import HistoryEntryResponse
from app.utils.formatting import to_iso_z

router = APIRouter()


@router.get("/history", response_model=List[HistoryEntryResponse])
def get_history(session: Session = Depends(get_session)):
    """Return all jobs as history entries, newest first."""
    jobs = session.exec(
        select(DownloadJob).order_by(DownloadJob.created_at.desc())
    ).all()

    return [
        HistoryEntryResponse(
            id=job.job_id,
            url=job.url,
            title=job.title or job.url,
            thumbnail=job.thumbnail,
            sourceType=job.source_type,
            status=job.status,
            timestamp=to_iso_z(job.created_at),
        )
        for job in jobs
    ]
