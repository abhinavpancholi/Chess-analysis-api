from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import create_tables
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(title="Chess Analysis API", lifespan=lifespan)


@app.get("/health")
async def health_check():
    return {"title": "Chess Analysis API","status": "ok"}