from models.change import Repository
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from services.github_service import GithubService


class RepositoryMonitorService:
    def __init__(self, github_service: GithubService, db: AsyncSession):
        self.github_service = github_service
        self.db = db

    async def monitor_repository(self, repo_name: str):
        latest_commit_sha = await self.github_service.get_latest_commit_sha(repo_name)
        print(latest_commit_sha)
    
    async def initialize_checkpoint(self, repository_name: str, branch: str = "main"):
        result = await self.db.execute(
            select(Repository).where(
                Repository.name == repository_name,
                Repository.branch == branch,
            )
        )
        repository = result.scalar_one_or_none()
        if repository and repository.checkpoint_sha:
            return repository
        latest_commit_sha = await self.github_service.get_latest_commit_sha(repository_name, branch)
        if repository is None:
            repository = Repository(
                name=repository_name,
                branch=branch,
                latest_commit_sha=latest_commit_sha,
                checkpoint_sha=latest_commit_sha,
            )
            self.db.add(repository)
        else:
            repository.latest_commit_sha = latest_commit_sha
            repository.checkpoint_sha = latest_commit_sha
        await self.db.commit()
        await self.db.refresh(repository)
        return repository