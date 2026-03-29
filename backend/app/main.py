import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_db_and_tables

# Import models so SQLModel registers them before create_all
from app.models import source, download_job, downloaded_file  # noqa: F401

from app.api.routes import analyze, downloads, jobs, library, channels, playlists, history

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("StreamVault API starting up…")
    create_db_and_tables()
    yield
    logger.info("StreamVault API shutting down.")


app = FastAPI(
    title="StreamVault API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all route groups under /api
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(downloads.router, prefix="/api", tags=["downloads"])
app.include_router(jobs.router, prefix="/api", tags=["jobs"])
app.include_router(library.router, prefix="/api", tags=["library"])
app.include_router(channels.router, prefix="/api", tags=["channels"])
app.include_router(playlists.router, prefix="/api", tags=["playlists"])
app.include_router(history.router, prefix="/api", tags=["history"])


@app.get("/health")
def health():
    return {"status": "ok"}
