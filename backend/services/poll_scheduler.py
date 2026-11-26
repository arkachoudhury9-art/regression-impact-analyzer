from apscheduler.schedulers.asyncio import AsyncIOScheduler
from config import github
from db.database import SessionLocal
from models.change import Repository
from sqlalchemy import select

from services.repository_monitor_service import RepositoryMonitorService


class PollScheduler:
    def __init__(
        self, repository_monitor_service: RepositoryMonitorService
    ):
        self.repository_monitor_service = repository_monitor_service
        

    async def poll(self):
        async with SessionLocal() as session:
            result = await session.execute(
                select(Repository).where(
                    Repository.name == github.REPOSITORY_NAME,
                    Repository.branch == github.REPOSITORY_BRANCH,
                )
            )
            repository = result.scalar_one_or_none()
            if repository:
                await self.repository_monitor_service.monitor_repository(repository.name)

scheduler = AsyncIOScheduler()