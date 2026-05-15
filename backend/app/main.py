from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

load_dotenv()

app = FastAPI(title="Scholar Management System API")

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.1.176:5173",
        "http://localhost:1420",
        "tauri://localhost",
        "http://tauri.localhost",
        "https://pgc-scholar-ms.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.core.events import register_event_listeners
from app.routers import (
    academic_records,
    announcements,
    auth,
    documents,
    pending_changes,
    remarks,
    scholars,
    submission_bins,
    sync,
)

register_event_listeners()

app.include_router(auth.router)
app.include_router(scholars.router)
app.include_router(academic_records.router)
app.include_router(pending_changes.router)
app.include_router(documents.router)
app.include_router(announcements.router)
app.include_router(submission_bins.router)
app.include_router(sync.router)
app.include_router(remarks.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
