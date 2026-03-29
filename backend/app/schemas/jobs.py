from typing import List, Optional

from pydantic import BaseModel


class JobStatusResponse(BaseModel):
    jobId: str
    status: str
    progress: float
    speed: Optional[str] = None
    eta: Optional[int] = None


class DownloadJobResponse(BaseModel):
    jobId: str
    url: str
    title: str
    thumbnail: str
    sourceType: str
    status: str
    progress: float
    speed: Optional[str] = None
    eta: Optional[int] = None
    format: Optional[str] = None
    quality: Optional[str] = None
    filesize: Optional[int] = None
    error: Optional[str] = None
    createdAt: str
    completedAt: Optional[str] = None


class JobsGroupedResponse(BaseModel):
    active: List[DownloadJobResponse]
    queued: List[DownloadJobResponse]
    completed: List[DownloadJobResponse]
    failed: List[DownloadJobResponse]
