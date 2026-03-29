from typing import List, Optional

from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    url: str


# ---- Format ----------------------------------------------------------------

class VideoFormat(BaseModel):
    format_id: str
    label: str
    ext: str
    resolution: str
    filesize: int
    audio: bool
    video: bool


# ---- Entries ---------------------------------------------------------------

class VideoEntry(BaseModel):
    id: str
    title: str
    thumbnail: str
    duration: int
    publishDate: Optional[str] = None


# ---- Source responses (discriminated union via `type`) ---------------------

class VideoSource(BaseModel):
    type: str = "video"
    id: str
    title: str
    thumbnail: str
    uploader: str
    duration: int
    publishDate: str
    description: Optional[str] = None
    formats: List[VideoFormat]


class PlaylistSource(BaseModel):
    type: str = "playlist"
    id: str
    title: str
    thumbnail: str
    uploader: str
    entryCount: int
    entries: List[VideoEntry]


class ChannelSource(BaseModel):
    type: str = "channel"
    id: str
    title: str
    thumbnail: str
    banner: str
    uploader: str
    subscriberCount: Optional[str] = None
    entryCount: int
    entries: List[VideoEntry]
    playlists: Optional[List[PlaylistSource]] = None
