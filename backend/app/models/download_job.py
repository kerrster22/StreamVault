from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class DownloadJob(SQLModel, table=True):
    __tablename__ = "download_job"

    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(unique=True, index=True)  # UUID string
    url: str
    title: str = ""
    thumbnail: str = ""
    source_type: str = "video"  # video / playlist / channel
    mode: str = "video"         # video / audio / both
    format_id: str = ""
    quality_preset: str = ""
    status: str = "queued"      # queued / downloading / completed / failed / paused
    progress: float = 0.0
    speed: Optional[str] = None
    eta: Optional[int] = None
    format: Optional[str] = None    # file extension, e.g. mp4
    quality: Optional[str] = None   # resolution label, e.g. 1080p
    filesize: Optional[int] = None
    error_message: Optional[str] = None
    output_path: Optional[str] = None
    source_id: Optional[int] = None  # FK to Source (optional)
    selected_entries: Optional[str] = None  # JSON-encoded list of entry IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
