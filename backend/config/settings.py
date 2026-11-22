import os
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from dotenv import load_dotenv

BACKEND_ENV_PATH = Path(__file__).resolve().parents[1] / ".env"


@dataclass(frozen=True)
class TypeSafeSettings:
    api_key: str
    base_url: str | None = None
    model: str | None = None


@dataclass(frozen=True)
class MongoSettings:
    url: str
    db_name: str


@dataclass(frozen=True)
class Settings:
    typesafe: TypeSafeSettings
    mongo: MongoSettings


class SettingsLoader(Protocol):
    def load(self) -> Settings:
        """Return app settings. An AWS Secrets Manager loader can implement this later."""


class EnvSettingsLoader:
    def __init__(self, env_path: Path = BACKEND_ENV_PATH) -> None:
        self.env_path = env_path

    def load(self) -> Settings:
        load_dotenv(self.env_path)
        return Settings(
            typesafe=TypeSafeSettings(
                api_key=self._required("TYPESAFE_API_KEY"),
                base_url=self._optional("TYPESAFE_BASE_URL"),
                model=self._optional("TYPESAFE_DEFAULT_MODEL"),
            ),
            mongo=MongoSettings(
                url=self._required("MONGODB_URL"),
                db_name=self._required("MONGO_DB_NAME"),
            ),
        )

    def _required(self, name: str) -> str:
        value = self._optional(name)
        if value is None:
            raise RuntimeError(f"{name} is not set in {self.env_path}")
        return value

    @staticmethod
    def _optional(name: str) -> str | None:
        return (os.getenv(name) or "").strip() or None
