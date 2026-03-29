from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.library import SavedPlaylistResponse
from app.utils.formatting import to_iso_z
from app.services.source_service import delete_source, get_sources_by_type, upsert_source

router = APIRouter()


class SavePlaylistRequest(BaseModel):
    playlistId: str
    title: str = ""
    thumbnail: str = ""
    uploader: str = ""
    itemCount: int = 0
    url: str = ""


@router.get("/playlists", response_model=List[SavedPlaylistResponse])
def get_playlists(session: Session = Depends(get_session)):
    sources = get_sources_by_type(session, "playlist")
    return [
        SavedPlaylistResponse(
            id=s.external_id,
            title=s.title,
            thumbnail=s.thumbnail,
            uploader=s.uploader,
            itemCount=s.entry_count,
            lastSynced=to_iso_z(s.last_checked or s.updated_at),
            downloadedCount=s.downloaded_count,
        )
        for s in sources
    ]


@router.post("/playlists", status_code=201)
def save_playlist(body: SavePlaylistRequest, session: Session = Depends(get_session)):
    upsert_source(session, {
        "external_id": body.playlistId,
        "url": body.url or f"https://www.youtube.com/playlist?list={body.playlistId}",
        "type": "playlist",
        "title": body.title,
        "thumbnail": body.thumbnail,
        "uploader": body.uploader,
        "entry_count": body.itemCount,
        "last_checked": datetime.utcnow(),
    })
    return {"ok": True}


@router.delete("/playlists/{playlist_id}")
def remove_playlist(playlist_id: str, session: Session = Depends(get_session)):
    if not delete_source(session, playlist_id):
        raise HTTPException(status_code=404, detail="Playlist not found")
    return {"ok": True}
