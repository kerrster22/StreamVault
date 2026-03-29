"""
RQ download task — executed by the worker process.

Progress flow:
  1. Worker sets job status → downloading in Redis + DB
  2. yt-dlp progress_hook pushes updates to Redis every tick
  3. postprocessor_hook captures final filename after FFmpeg processing
  4. On finish/error, worker writes final state to DB and clears Redis TTL
"""
import dataclasses
import json
import logging
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import redis as redis_lib
import yt_dlp
from sqlmodel import Session, select

from app.core.config import settings
from app.core.database import engine
from app.models.download_job import DownloadJob
from app.models.downloaded_file import DownloadedFile
from app.services.download_service import get_redis
from app.utils.paths import output_dir_for
from app.utils.formatting import format_speed
from app.utils.ytdlp import build_base_opts, writable_cookie_file

logger = logging.getLogger(__name__)


@dataclasses.dataclass
class _JobPayload:
    """
    Plain serializable snapshot of DownloadJob fields needed by the download
    execution path.  Populated while the DB session is still open so that ORM
    attribute expiry after commit (expire_on_commit=True) and session close
    cannot cause DetachedInstanceError during the long-running yt-dlp call.
    """
    job_id: str
    url: str
    title: str
    source_type: str
    mode: str
    format_id: str
    quality_preset: str
    selected_entries: Optional[str]


def _update_redis(r: redis_lib.Redis, job_id: str, data: dict):
    key = f"job:{job_id}"
    # Filter None; convert everything else to str so hset is happy
    mapping = {k: str(v) for k, v in data.items() if v is not None}
    if mapping:
        r.hset(key, mapping=mapping)
    r.expire(key, 86400)  # 24-hour TTL


# ---------------------------------------------------------------------------
# Main task (RQ entry point)
# ---------------------------------------------------------------------------

def run_download(job_id: str):
    """Entry point invoked by RQ worker."""
    logger.info("Starting download task for job %s", job_id)

    r: Optional[redis_lib.Redis] = None

    try:
        r = get_redis()

        with Session(engine) as session:
            job = session.exec(select(DownloadJob).where(DownloadJob.job_id == job_id)).first()
            if not job:
                logger.error("Job %s not found in DB", job_id)
                return

            # Snapshot required fields into a plain object BEFORE commit.
            # SQLAlchemy expires all ORM attributes on commit (expire_on_commit=True).
            # Passing an expired+detached instance into long-running code causes
            # DetachedInstanceError on first attribute access.  A plain dataclass
            # has no ORM lifecycle and is safe to use freely after session close.
            payload = _JobPayload(
                job_id=job.job_id,
                url=job.url,
                title=job.title,
                source_type=job.source_type,
                mode=job.mode,
                format_id=job.format_id,
                quality_preset=job.quality_preset,
                selected_entries=job.selected_entries,
            )

            _update_redis(r, job_id, {"status": "downloading", "progress": "0"})
            job.status = "downloading"
            job.updated_at = datetime.utcnow()
            session.add(job)
            session.commit()
            # Session closes here via context manager exit.
            # payload is a plain dataclass — no session dependency.

        final_files, meta = _execute_download(payload, r)
    except Exception as exc:
        logger.exception("Download failed for job %s: %s", job_id, exc)
        _fail_job(job_id, r, str(exc))
        return

    _finish_job(job_id, r, final_files, meta)


# ---------------------------------------------------------------------------
# Download execution
# ---------------------------------------------------------------------------

def _execute_download(job: _JobPayload, r: redis_lib.Redis):
    """
    Run yt-dlp and return (final_files, meta).

    final_files: list of {filepath, filename, filesize}
    meta: dict with title, thumbnail, uploader from yt-dlp info
    """
    source_name = job.title or ""
    out_dir = output_dir_for(job.source_type, source_name)
    start_time = time.time()

    final_files: List[Dict] = []
    meta: Dict[str, str] = {}

    def progress_hook(d: Dict[str, Any]):
        if d["status"] == "downloading":
            total = d.get("total_bytes") or d.get("total_bytes_estimate") or 0
            done = d.get("downloaded_bytes") or 0
            pct = (done / total * 100) if total else 0
            speed = d.get("speed") or 0
            speed_str = format_speed(speed) if speed else ""
            eta = d.get("eta")
            _update_redis(r, job.job_id, {
                "status": "downloading",
                "progress": round(pct, 1),
                "speed": speed_str,
                "eta": eta if eta is not None else "",
                "filename": Path(d.get("filename", "")).name,
            })

    def postprocessor_hook(d: Dict[str, Any]):
        """Captures the final filename after FFmpeg postprocessing (e.g. mp3 conversion)."""
        if d["status"] == "finished":
            # info_dict contains the final post-processed filepath
            info = d.get("info_dict", {})
            filepath = info.get("filepath") or d.get("filename", "")
            if not filepath:
                return
            p = Path(filepath)
            if p.exists():
                final_files.append({
                    "filepath": str(p),
                    "filename": p.name,
                    "filesize": p.stat().st_size,
                    "duration": int(info.get("duration") or 0),
                    "title": info.get("title") or "",
                    "uploader": info.get("uploader") or info.get("channel") or "",
                    "thumbnail": info.get("thumbnail") or "",
                })
            # Capture top-level meta from first entry
            if not meta:
                meta.update({
                    "title": info.get("title") or "",
                    "thumbnail": info.get("thumbnail") or "",
                    "uploader": info.get("uploader") or info.get("channel") or "",
                })

    ydl_opts = _build_ydl_opts(job, out_dir, progress_hook, postprocessor_hook)

    with writable_cookie_file() as cookie_path:
        if cookie_path:
            ydl_opts["cookiefile"] = cookie_path
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([job.url])

    # Fallback: if postprocessor_hook didn't fire (some formats skip it),
    # scan the output dir for files written since we started.
    if not final_files:
        final_files = _scan_new_files(out_dir, start_time)

    return final_files, meta


def _build_ydl_opts(
    job: _JobPayload,
    out_dir: Path,
    progress_hook,
    postprocessor_hook,
) -> dict:
    # Safe outtmpl: uses uploader with NA fallback, title always present
    outtmpl = str(out_dir / "%(uploader,channel,NA)s - %(title)s [%(id)s].%(ext)s")

    opts = build_base_opts()
    opts.update({
        "outtmpl": outtmpl,
        "progress_hooks": [progress_hook],
        "postprocessor_hooks": [postprocessor_hook],
        "ignoreerrors": True,
        "retries": 3,
        "fragment_retries": 3,
    })

    if job.mode == "audio":
        opts["format"] = "bestaudio/best"
        opts["postprocessors"] = [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": settings.DEFAULT_AUDIO_FORMAT,
            "preferredquality": settings.DEFAULT_AUDIO_QUALITY,
        }]
    else:
        # Build a robust format selector:
        #   1. Try the specific requested format merged with best audio (DASH)
        #   2. Fall back to best video+audio at the requested quality
        #   3. Final fallback: best available
        if job.format_id and job.format_id not in ("best", "bestaudio"):
            opts["format"] = (
                f"{job.format_id}+bestaudio"
                f"/bestvideo[format_id={job.format_id}]+bestaudio"
                f"/bestvideo+bestaudio/best"
            )
        elif job.quality_preset:
            h = _quality_to_height(job.quality_preset)
            opts["format"] = (
                f"bestvideo[height<={h}]+bestaudio"
                f"/best[height<={h}]/best"
            )
        else:
            opts["format"] = "bestvideo+bestaudio/best"

        opts["merge_output_format"] = "mp4"

    # Restrict to selected playlist entries if provided
    if job.selected_entries:
        try:
            entries = json.loads(job.selected_entries)
            if entries:
                opts["playlist_items"] = ",".join(str(e) for e in entries)
        except (json.JSONDecodeError, TypeError):
            pass

    return opts


def _quality_to_height(preset: str) -> int:
    return {"4k": 2160, "1080p": 1080, "720p": 720, "480p": 480, "360p": 360}.get(
        preset.lower(), 1080
    )


def _scan_new_files(out_dir: Path, since: float) -> List[Dict]:
    """Fallback: collect files written to out_dir after `since` (epoch seconds)."""
    results = []
    for fp in out_dir.rglob("*"):
        if not fp.is_file():
            continue
        st = fp.stat()
        if st.st_mtime >= since:
            results.append({
                "filepath": str(fp),
                "filename": fp.name,
                "filesize": st.st_size,
                "duration": 0,
                "title": "",
                "uploader": "",
                "thumbnail": "",
            })
    return results


# ---------------------------------------------------------------------------
# Job finalisation
# ---------------------------------------------------------------------------

def _finish_job(job_id: str, r: redis_lib.Redis, files: List[Dict], meta: Dict):
    now = datetime.utcnow()

    with Session(engine) as session:
        job = session.exec(select(DownloadJob).where(DownloadJob.job_id == job_id)).first()
        if not job:
            return

        # Update job title/thumbnail from yt-dlp metadata if we got it
        if meta.get("title") and not job.title:
            job.title = meta["title"]
        if meta.get("thumbnail") and not job.thumbnail:
            job.thumbnail = meta["thumbnail"]

        for f in files:
            ext = Path(f["filepath"]).suffix.lstrip(".")
            media_type = "audio" if job.mode == "audio" else "video"
            session.add(DownloadedFile(
                job_id=job.job_id,
                filepath=f["filepath"],
                filename=f["filename"],
                ext=ext,
                filesize=f.get("filesize", 0),
                duration=f.get("duration", 0),
                media_type=media_type,
                thumbnail=f.get("thumbnail") or job.thumbnail,
                title=f.get("title") or job.title,
                uploader=f.get("uploader", ""),
                quality=job.quality or "",
                source_type=job.source_type,
            ))

        job.status = "completed"
        job.progress = 100.0
        job.updated_at = now
        job.completed_at = now
        session.add(job)
        session.commit()

    _update_redis(r, job_id, {"status": "completed", "progress": "100"})
    logger.info("Job %s completed — %d file(s)", job_id, len(files))


def _fail_job(job_id: str, r: Optional[redis_lib.Redis], error: str):
    now = datetime.utcnow()

    with Session(engine) as session:
        job = session.exec(select(DownloadJob).where(DownloadJob.job_id == job_id)).first()
        if job:
            job.status = "failed"
            job.error_message = error[:1000]
            job.updated_at = now
            session.add(job)
            session.commit()

    if r is not None:
        _update_redis(r, job_id, {"status": "failed", "error": error[:200]})
    logger.error("Job %s failed: %s", job_id, error[:200])
