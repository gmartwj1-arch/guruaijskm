import os
from pathlib import Path
from fastapi.responses import FileResponse, RedirectResponse
from backend.app import app, PAGES_DIR

@app.get("/api/index.py")
async def vercel_index():
    return FileResponse(PAGES_DIR / "index.html")

@app.get("/api")
async def vercel_api():
    return FileResponse(PAGES_DIR / "index.html")
