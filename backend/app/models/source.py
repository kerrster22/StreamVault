from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Source(SQLModel, table=True):
    __tablename__ = "source"

    id: Optional[int] = Field(default=None, primary_key=True)
    external_id: str = Field(index=True)
    url: str
    type: str  # video / playlist / channel
    title: str = ""
    thumbnail: str = ""
    banner: str = ""
    uploader: str = ""
    description: str = ""
    entry_count: int = 0
    monitor_enabled: bool = False
    downloaded_count: int = 0
    last_checked: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
