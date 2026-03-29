# StreamVault

Self-hosted media downloader with a Plex/Jellyfin-inspired UI. Powered by yt-dlp and FFmpeg.

## Quick Start

```bash
git clone <repo-url>
cd StreamVault
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:8000
- API docs: http://localhost:8000/docs

## What Runs in Docker

| Service    | Role                                     |
|------------|------------------------------------------|
| `redis`    | Job queue broker                         |
| `api`      | FastAPI backend (yt-dlp analysis, REST)  |
| `worker`   | RQ download worker (yt-dlp + FFmpeg)     |
| `frontend` | Next.js UI                               |

Downloaded files land in a named Docker volume (`media_data`).
The SQLite database is in `db_data`.

## Local Development (without Docker)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
# Start Redis separately (e.g. redis-server or Docker)
uvicorn app.main:app --reload --port 8000
# In a second terminal:
python -m app.workers.rq_worker
```

**Frontend:**
```bash
# In repo root
npm install
BACKEND_URL=http://localhost:8000 npm run dev
```

## Configuration

Copy `backend/.env.example` to `backend/.env` and adjust. Key vars:

| Variable                      | Default                          | Notes                          |
|-------------------------------|----------------------------------|--------------------------------|
| `REDIS_URL`                   | `redis://redis:6379`             | Redis connection               |
| `MEDIA_ROOT`                  | `/media`                         | Where downloads are stored     |
| `DATABASE_URL`                | `sqlite:////data/streamvault.db` | SQLite path                    |
| `CORS_ORIGINS`                | `http://localhost:3000,...`      | Comma-separated origins        |
| `MAX_ANALYZE_ENTRIES_PREVIEW` | `50`                             | Max items returned in analysis |

## What's Fully Working

- URL analysis via yt-dlp (video, playlist, channel detection)
- Format selection and download queuing
- RQ background worker executes downloads with progress tracking
- Progress tracked in Redis, polled by UI every 3s on the Downloads page
- Downloaded files persisted in SQLite
- Library, history, channels, playlists pages show real data
- Docker Compose starts the full stack in one command

## What's Scaffolded / Not Yet Wired

- **Channel monitoring** — CRUD works, no scheduled polling daemon
- **Playlist auto-sync** — CRUD works, no auto-sync
- **Collections page** — frontend only, no backend
- **Settings persistence** — frontend-only; backend config is env-only
- **File serving / playback** — files are on disk but no streaming endpoint
