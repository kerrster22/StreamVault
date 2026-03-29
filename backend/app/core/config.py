from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_ENV: str = "development"

    # Database
    DATABASE_URL: str = "sqlite:////data/streamvault.db"

    # Redis
    REDIS_URL: str = "redis://redis:6379"

    # File storage
    MEDIA_ROOT: str = "/media"
    TEMP_DOWNLOAD_ROOT: str = "/tmp/streamvault"

    # CORS - comma-separated list
    CORS_ORIGINS: str = "http://localhost:3000,http://frontend:3000"

    # FFmpeg
    FFMPEG_PATH: Optional[str] = None
    FFPROBE_PATH: Optional[str] = None

    # yt-dlp cookies — path to a Netscape-format cookies.txt inside the container.
    # Mount the file via Docker volume and set this env var to enable authenticated
    # extraction (e.g. age-restricted or sign-in-required YouTube videos).
    # Leave unset to run without cookies (fine for most public content).
    YTDLP_COOKIES_FILE: Optional[str] = None

    # yt-dlp youtube:tab extractor — skip the authentication pre-check for
    # playlist and channel analysis.  When True (the default), passes
    #   extractor_args={"youtubetab": {"skip": ["authcheck"]}}
    # to yt-dlp, suppressing YouTube's "Playlists that require authentication
    # may not extract correctly" gate.  This is the correct default for
    # self-hosted installs analysing public playlists/channels.
    # Set to False only if you need strict auth enforcement and have valid
    # cookies configured (e.g. you are exclusively accessing private content).
    YTDLP_SKIP_YOUTUBETAB_AUTHCHECK: bool = True

    # yt-dlp defaults
    DEFAULT_AUDIO_FORMAT: str = "mp3"
    DEFAULT_AUDIO_QUALITY: str = "192"

    # Analysis limits
    MAX_ANALYZE_ENTRIES_PREVIEW: int = 50

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
