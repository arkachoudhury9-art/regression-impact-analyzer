import logging
from contextlib import asynccontextmanager

from config import github
from db.database import Base, SessionLocal, engine
from db.mongodb import MongoDB
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analysis import router as analysis_router
from routes.change import router as change_router
from routes.webhook import router as webhook_router
from services.github_service import GithubService
from services.poll_scheduler import PollScheduler, scheduler
from services.repository_monitor_service import RepositoryMonitorService

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s:%(name)s:%(message)s",
)

mongodb = MongoDB()

@asynccontextmanager
async def lifespan(app: FastAPI) :
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with SessionLocal() as db:
        repository_monitor_service = RepositoryMonitorService(GithubService(), db)
        await repository_monitor_service.initialize_checkpoint(github.REPOSITORY_NAME, github.REPOSITORY_BRANCH)
        poll_scheduler = PollScheduler(repository_monitor_service)
        scheduler.add_job(poll_scheduler.poll, "interval", seconds=10,max_instances=1,coalesce=True,replace_existing=True)
        scheduler.start()
    await mongodb.connect()
    try:
        yield
    
    finally:
        scheduler.shutdown()
        await mongodb.close()
        await engine.dispose()

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "ok": True,
        "items": ["Item one", "Item two", "Item three"],
    }


app.include_router(webhook_router)
app.include_router(change_router)
app.include_router(analysis_router)
