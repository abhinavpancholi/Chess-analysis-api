from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import create_tables
from app.routers import auth, games
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(title="Chess Analysis API", lifespan=lifespan)

app.include_router(auth.router)
app.include_router(games.router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}