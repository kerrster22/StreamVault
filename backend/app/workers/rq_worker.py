"""
RQ worker entry point.

Run with:
    python -m app.workers.rq_worker
"""
import logging
import os
import sys

# Ensure the backend root is on sys.path when running directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import redis
from rq import Worker, Queue

from app.core.config import settings
from app.core.database import create_db_and_tables

# Import all models so SQLModel registers them before create_all
from app.models import source, download_job, downloaded_file  # noqa: F401

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def main():
    logger.info("Initialising database tables…")
    create_db_and_tables()

    logger.info("Connecting to Redis at %s", settings.REDIS_URL)
    r = redis.from_url(settings.REDIS_URL)

    queues = [Queue("downloads", connection=r)]
    worker = Worker(queues, connection=r)
    logger.info("Worker ready — listening on queue: downloads")
    worker.work()


if __name__ == "__main__":
    main()
