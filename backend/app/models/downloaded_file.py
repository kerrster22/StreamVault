from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class DownloadedFile(SQLModel, table=True):
    __tablename__ = "downloaded_file"

    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(index=True)  # matches DownloadJob.job_id
    filepath: str
    filename: str
    ext: str = ""
    filesize: int = 0
    duration: int = 0          # seconds
    media_type: str = "video"  # video / audio
    thumbnail: str = ""
    title: str = ""
    uploader: str = ""
    quality: str = ""
    source_type: str = "video"
    channel_id: Optional[str] = None   # external channel ID
    playlist_id: Optional[str] = None  # external playlist ID
    created_at: datetime = Field(default_factory=datetime.utcnow)
