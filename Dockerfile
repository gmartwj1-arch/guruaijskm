FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=10000

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR /app
COPY --chown=user:user . /app

# Expose port (Render uses 10000 or dynamic $PORT)
EXPOSE 10000
EXPOSE 8000

# Run FastAPI dynamically using $PORT
CMD uvicorn backend.app:app --host 0.0.0.0 --port ${PORT:-10000}
