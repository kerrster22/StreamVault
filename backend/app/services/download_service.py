"""
Download service — creates DB jobs and enqueues RQ tasks.
"""
import json
import logging
import uuid
from datetime import datetime
from typing import Optional

import redis as redis_lib
from rq import Queue
from sqlmodel import Session

from app.core.config import settings
from app.models.download_job import DownloadJob
from app.schemas.downloads import DownloadRequest, DownloadResponse

logger = logging.getLogger(__name__)


def get_redis() -> redis_lib.Redis:
    return redis_lib.from_url(settings.REDIS_URL, decode_responses=True)


def get_queue() -> Queue:
    r = redis_lib.from_url(settings.REDIS_URL)  # RQ needs bytes-mode connection
    return Queue("downloads", connection=r)


def create_and_enqueue(request: DownloadRequest, session: Session) -> DownloadResponse:
    """Create a DB job record and enqueue the RQ download task."""
    job_id = str(uuid.uuid4())

    job = DownloadJob(
        job_id=job_id,
        url=request.url,
        source_type=request.sourceType,
        mode=request.mode,
        format_id=request.formatId or "",
        quality_preset=request.qualityPreset or "",
        status="queued",
        selected_entries=json.dumps(request.selectedEntries) if request.selectedEntries else None,
    )
    session.add(job)
    session.commit()
    session.refresh(job)

    try:
        q = get_queue()
        q.enqueue(
            "app.workers.download_tasks.run_download",
            kwargs={"job_id": job_id},
            job_timeout=3600 * 6,  # 6-hour max per job
        )
    except Exception as exc:
        logger.error("Failed to enqueue download job %s: %s", job_id, exc)
        job.status = "failed"
        job.error_message = f"Failed to enqueue: {exc}"
        session.add(job)
        session.commit()

    return DownloadResponse(jobId=job_id, status=job.status)


def get_live_progress(job_id: str) -> Optional[dict]:
    """Read live progress dict from Redis. Returns None if no entry exists."""
    try:
        r = get_redis()
        data = r.hgetall(f"job:{job_id}")
        return data if data else None
    except Exception:
        return None
