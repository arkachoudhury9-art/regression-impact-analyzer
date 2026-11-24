import asyncio
import os
from pathlib import Path
from typing import Any
from urllib.parse import quote

import httpx
from config.criticality import CRITICALITY_HIGH_THRESHOLD, CRITICALITY_MEDIUM_THRESHOLD
from config.github import GITHUB_ACCEPT_HEADER, GITHUB_API_VERSION
from dotenv import load_dotenv
from fastapi import HTTPException
from models.change import Criticality, Repository
from schemas.github import GitCodeChanges, GitFileContent, GitSourceTree
from sqlalchemy import select
from sqlalchemy.orm import Session

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def github_headers() -> dict[str, str]:
    headers = {
        "Accept": GITHUB_ACCEPT_HEADER,
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
    }
    token = (os.getenv("GITHUB_TOKEN") or "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


class GithubService:
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url="https://api.github.com",
            headers=github_headers(),
        )

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc_info: object):
        await self.client.aclose()

    async def _get(self, url: str, params: dict[str, str] | None = None) -> dict[str, Any]:
        response = await self.client.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.json())
        return response.json()

    async def get_source_tree(self, repo_name: str, commit_sha: str) -> GitSourceTree:
        payload = await self._get(
            f"/repos/{repo_name}/git/trees/{commit_sha}",
            {"recursive": "1"},
        )
        return GitSourceTree.model_validate(payload)

    async def get_repository_snapshot(self, repo_name: str, commit_sha: str) -> bytes:
        response = await self.client.get(
            f"/repos/{repo_name}/zipball/{commit_sha}",
            follow_redirects=True,
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.content

    async def get_code_changes(
        self,
        repo_name: str,
        before_commit_sha: str,
        after_commit_sha: str,
    ) -> GitCodeChanges:
        payload = await self._get(
            f"/repos/{repo_name}/compare/{before_commit_sha}...{after_commit_sha}",
        )
        return GitCodeChanges.model_validate(payload)

    async def get_file_contents(
        self,
        repo_name: str,
        commit_sha: str,
        file_path_list: list[str],
    ) -> list[GitFileContent]:
        payloads = await asyncio.gather(
            *(
                self._get(
                    f"/repos/{repo_name}/contents/{quote(file_path, safe='/')}",
                    {"ref": commit_sha},
                )
                for file_path in file_path_list
            )
        )
        return [GitFileContent.model_validate(payload) for payload in payloads]

    def save_repository(self, db: Session, name: str) -> Repository:
        repository = db.scalar(select(Repository).where(Repository.name == name))
        if repository is None:
            repository = Repository(name=name)
            db.add(repository)
            db.commit()
            db.refresh(repository)
        return repository

    def get_criticality(self, score: float) -> Criticality:
        if score < CRITICALITY_MEDIUM_THRESHOLD:
            return Criticality.LOW
        elif score < CRITICALITY_HIGH_THRESHOLD:
            return Criticality.MEDIUM
        else:
            return Criticality.HIGH