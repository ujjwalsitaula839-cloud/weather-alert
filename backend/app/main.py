import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.base import Base
from app.db.session import engine
from app.api import auth, users
from app.tasks.scheduler import start_scheduler

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables (in a real app you'd use Alembic migrations)
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the background scheduler
    logger.info("Starting up Rain Alert application...")
    # start_scheduler() # Temporarily disabled for debugging
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="Rain Alert System API",
    description="Backend API for the Rain Alert System",
    version="1.0.0",
    lifespan=lifespan
)

import traceback
from fastapi import Request
from fastapi.responses import PlainTextResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("GLOBAL EXCEPTION:", exc)
    return PlainTextResponse(str(traceback.format_exc()), status_code=500)

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Rain Alert System API"}
