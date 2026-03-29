from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.downloaded_file import DownloadedFile
from app.schemas.library import LibraryItem

router = APIRouter()


@router.get("/library", response_model=list[LibraryItem])
def get_library(session: Session = Depends(get_session)):
    """Return all downloaded files as library items."""
    files = session.exec(
        select(DownloadedFile).order_by(DownloadedFile.created_at.desc())
    ).all()
    return [LibraryItem.from_db(f) for f in files]
