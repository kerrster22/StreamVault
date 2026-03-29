"""
Source service — CRUD for saved channels and playlists.
"""
from datetime import datetime
from typing import List, Optional

from sqlmodel import Session, select

from app.models.source import Source


def get_sources_by_type(session: Session, source_type: str) -> List[Source]:
    stmt = select(Source).where(Source.type == source_type).order_by(Source.created_at.desc())
    return session.exec(stmt).all()


def get_source_by_external_id(session: Session, external_id: str) -> Optional[Source]:
    stmt = select(Source).where(Source.external_id == external_id)
    return session.exec(stmt).first()


def upsert_source(session: Session, data: dict) -> Source:
    existing = get_source_by_external_id(session, data["external_id"])
    if existing:
        for k, v in data.items():
            setattr(existing, k, v)
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    source = Source(**data)
    session.add(source)
    session.commit()
    session.refresh(source)
    return source


def delete_source(session: Session, external_id: str) -> bool:
    source = get_source_by_external_id(session, external_id)
    if not source:
        return False
    session.delete(source)
    session.commit()
    return True


def toggle_monitoring(session: Session, external_id: str, enabled: bool) -> Optional[Source]:
    source = get_source_by_external_id(session, external_id)
    if not source:
        return None
    source.monitor_enabled = enabled
    source.updated_at = datetime.utcnow()
    session.add(source)
    session.commit()
    session.refresh(source)
    return source
