from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.library import SavedChannelResponse
from app.utils.formatting import to_iso_z
from app.services.source_service import (
    delete_source,
    get_sources_by_type,
    toggle_monitoring,
    upsert_source,
)

router = APIRouter()


class SaveChannelRequest(BaseModel):
    channelId: str
    title: str = ""
    thumbnail: str = ""
    banner: str = ""
    monitoring: bool = False
    url: str = ""


@router.get("/channels", response_model=List[SavedChannelResponse])
def get_channels(session: Session = Depends(get_session)):
    sources = get_sources_by_type(session, "channel")
    return [
        SavedChannelResponse(
            id=s.external_id,
            title=s.title,
            thumbnail=s.thumbnail,
            banner=s.banner,
            videoCount=s.entry_count,
            lastChecked=to_iso_z(s.last_checked or s.updated_at),
            monitoring=s.monitor_enabled,
        )
        for s in sources
    ]


@router.post("/channels", status_code=201)
def save_channel(body: SaveChannelRequest, session: Session = Depends(get_session)):
    upsert_source(session, {
        "external_id": body.channelId,
        "url": body.url or f"https://www.youtube.com/channel/{body.channelId}",
        "type": "channel",
        "title": body.title,
        "thumbnail": body.thumbnail,
        "banner": body.banner,
        "monitor_enabled": body.monitoring,
        "last_checked": datetime.utcnow(),
    })
    return {"ok": True}


@router.delete("/channels/{channel_id}")
def remove_channel(channel_id: str, session: Session = Depends(get_session)):
    if not delete_source(session, channel_id):
        raise HTTPException(status_code=404, detail="Channel not found")
    return {"ok": True}


@router.patch("/channels/{channel_id}/monitoring")
def set_monitoring(channel_id: str, enabled: bool, session: Session = Depends(get_session)):
    src = toggle_monitoring(session, channel_id, enabled)
    if not src:
        raise HTTPException(status_code=404, detail="Channel not found")
    return {"ok": True}
