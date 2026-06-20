import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.dependencies.auth import initialize_firebase_app
from app.routers.v1 import router as v1_router
from app.database import verify_and_setup_db
import app.database as _db
from app.jobs.notification_scheduler import notification_scheduler_loop


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Initialize external SDKs and verify/setup DB before accepting requests."""
    initialize_firebase_app()
    await verify_and_setup_db()
    # Pass a proxy so the scheduler always uses the live async_session,
    # even after verify_and_setup_db swaps the engine to SQLite.
    class _SessionProxy:
        def __call__(self):
            return _db.async_session()
    asyncio.create_task(notification_scheduler_loop(_SessionProxy()))
    yield



app = FastAPI(
    title="Baby Tracker API",
    description="REST API for the Baby Tracker application",
    version="0.0.1",
    lifespan=lifespan,
)

# CORS — allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount versioned API routes
app.include_router(v1_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring and container orchestration."""
    return {"status": "ok", "service": "backend"}
# Trigger reload for .env v2
