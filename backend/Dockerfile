FROM python:3.11-slim

# Prevent Python from writing .pyc files to the bind-mounted source tree.
# On Windows Docker (virtio-fs), mtime of mounted files is unreliable, which
# can cause Python to use stale compiled bytecode from the host __pycache__
# instead of recompiling from the current source.  This flag eliminates that
# class of bug entirely.  PYTHONUNBUFFERED ensures log output is flushed
# immediately so worker logs are visible in real time.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install ffmpeg and other system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create media and data directories
RUN mkdir -p /media /data /tmp/streamvault

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
