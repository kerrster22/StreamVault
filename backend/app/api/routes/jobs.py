import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.download_job import DownloadJob
from app.schemas.downloads import DownloadRequest
from app.schemas.jobs import DownloadJobResponse, JobStatusResponse, JobsGroupedResponse
from app.services.download_service import create_and_enqueue, get_live_progress
from app.utils.formatting import to_iso_z

logger = logging.getLogger(__name__)

router = APIRouter()


def _build_response(job: DownloadJob) -> DownloadJobResponse:
    """Build a DownloadJobResponse, overlaying Redis live data without mutating the ORM object."""
    live = get_live_progress(job.job_id) or {}

    status = live.get("status") or job.status
    progress = float(live.get("progress") or job.progress)
    speed = live.get("speed") or job.speed or None
    eta_raw = live.get("eta") or job.eta
    eta = int(eta_raw) if eta_raw else None

    # Strip empty strings from Redis back to None
    if speed == "":
        speed = None

    return DownloadJobResponse(
        jobId=job.job_id,
        url=job.url,
        title=job.title,
        thumbnail=job.thumbnail,
        sourceType=job.source_type,
        status=status,
        progress=progress,
        speed=speed,
        eta=eta,
        format=job.format,
        quality=job.quality,
        filesize=job.filesize,
        error=job.error_message,
        createdAt=to_iso_z(job.created_at),
        completedAt=to_iso_z(job.completed_at) if job.completed_at else None,
    )


@router.get("/jobs", response_model=JobsGroupedResponse)
def get_jobs(session: Session = Depends(get_session)):
    """Return all jobs grouped by status."""
    all_jobs = session.exec(
        select(DownloadJob).order_by(DownloadJob.created_at.desc())
    ).all()

    active, queued, completed, failed = [], [], [], []
    for job in all_jobs:
        resp = _build_response(job)
        if resp.status == "downloading":
            active.append(resp)
        elif resp.status == "queued":
            queued.append(resp)
        elif resp.status == "completed":
            completed.append(resp)
        elif resp.status in ("failed", "paused"):
            failed.append(resp)

    return JobsGroupedResponse(active=active, queued=queued, completed=completed, failed=failed)


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str, session: Session = Depends(get_session)):
    """Return live status for a single job (reads Redis first)."""
    job = session.exec(select(DownloadJob).where(DownloadJob.job_id == job_id)).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    resp = _build_response(job)
    return JobStatusResponse(jobId=resp.jobId, status=resp.status, progress=resp.progress, speed=resp.speed, eta=resp.eta)


@router.delete("/jobs/{job_id}")
def cancel_job(job_id: str, session: Session = Depends(get_session)):
    """Cancel a queued or downloading job."""
    job = session.exec(select(DownloadJob).where(DownloadJob.job_id == job_id)).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.status = "failed"
    job.error_message = "Cancelled by user"
    job.updated_at = datetime.utcnow()
    session.add(job)
    session.commit()

    # Best-effort: cancel in RQ (may already be running)
    try:
        from app.services.download_service import get_queue
        q = get_queue()
        rq_job = q.fetch_job(job_id)
        if rq_job:
            rq_job.cancel()
    except Exception:
        pass

    return {"ok": True}


@router.post("/jobs/{job_id}/retry")
def retry_job(job_id: str, session: Session = Depends(get_session)):
    """Re-queue a failed job as a new job."""
    job = session.exec(select(DownloadJob).where(DownloadJob.job_id == job_id)).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    new_req = DownloadRequest(
        url=job.url,
        sourceType=job.source_type,
        formatId=job.format_id or "",
        mode=job.mode,
    )
    result = create_and_enqueue(new_req, session)
    return {"jobId": result.jobId, "status": result.status}
