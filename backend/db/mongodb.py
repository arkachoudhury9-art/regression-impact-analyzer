import logging

from config.settings import EnvSettingsLoader, SettingsLoader
from pymongo import AsyncMongoClient

logger = logging.getLogger(__name__)


class MongoDB:
    def __init__(self, settings_loader: SettingsLoader | None = None) -> None:
        self.settings = (settings_loader or EnvSettingsLoader()).load().mongo
        self.client = AsyncMongoClient(self.settings.url)
        self.db = self.client[self.settings.db_name]

    async def connect(self) -> None:
        await self.client.admin.command("ping")
        logger.info("Connected to MongoDB database '%s'", self.settings.db_name)

    async def close(self) -> None:
        await self.client.close()
        logger.info("Disconnected from MongoDB")
