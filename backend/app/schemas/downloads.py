from typing import List, Optional

from pydantic import BaseModel


class DownloadRequest(BaseModel):
    url: str
    sourceType: str          # video / playlist / channel
    formatId: str = ""
    mode: str = "video"      # video / audio / both
    selectedEntries: Optional[List[str]] = None
    qualityPreset: Optional[str] = None
    subtitles: bool = False
    saveMetadata: bool = False


class DownloadResponse(BaseModel):
    jobId: str
    status: str
