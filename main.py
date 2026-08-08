from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .api.users import router as users_router
from .meetings.router import router as meetings_router

# Import models so SQLAlchemy knows about the tables
from . import models  # noqa: F401


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="MeetMind AI",
    description="AI-powered meeting intelligence platform",
    version="1.0.0",
)


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Authentication routes
app.include_router(users_router)


# Meeting routes
app.include_router(meetings_router)


@app.get("/")
def root():
    return {
        "message": "MeetMind AI backend is running",
        "status": "success",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }