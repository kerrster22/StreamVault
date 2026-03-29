from typing import List, Optional

from pydantic import BaseModel

from app.models.downloaded_file import DownloadedFile
from app.utils.formatting import to_iso_z


class LibraryItem(BaseModel):
    id: str
    title: str
    thumbnail: str
    uploader: str
    duration: int
    filesize: int
    format: str
    quality: str
    downloadedAt: str
    filePath: str
    sourceType: str
    channelId: Optional[str] = None
    playlistId: Optional[str] = None

    @classmethod
    def from_db(cls, f: DownloadedFile) -> "LibraryItem":
        return cls(
            id=str(f.id),
            title=f.title,
            thumbnail=f.thumbnail,
            uploader=f.uploader,
            duration=f.duration,
            filesize=f.filesize,
            format=f.ext,
            quality=f.quality,
            downloadedAt=to_iso_z(f.created_at),
            filePath=f.filepath,
            sourceType=f.source_type,
            channelId=f.channel_id,
            playlistId=f.playlist_id,
        )


class SavedChannelResponse(BaseModel):
    id: str
    title: str
    thumbnail: str
    banner: str
    videoCount: int
    lastChecked: str
    monitoring: bool


class SavedPlaylistResponse(BaseModel):
    id: str
    title: str
    thumbnail: str
    uploader: str
    itemCount: int
    lastSynced: str
    downloadedCount: int


class HistoryEntryResponse(BaseModel):
    id: str
    url: str
    title: str
    thumbnail: str
    sourceType: str
    status: str
    timestamp: str
