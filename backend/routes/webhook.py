import asyncio
import json
from typing import Annotated, Any

from db.database import get_db
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from schemas.github import GitHubPushWebhook
from services.change_category_service import ChangeCategoryService
from services.github_service import GithubService
from services.helper import build_changed_files
from sqlalchemy.orm import Session

router = APIRouter(prefix="/webhook", tags=["webhook"])


def write_request(file_name: str, request: Any) -> None:
    if isinstance(request, BaseModel):
        payload = request.model_dump(mode="json", by_alias=True)
    elif isinstance(request, list):
        payload = [
            item.model_dump(mode="json", by_alias=True) if isinstance(item, BaseModel) else item
            for item in request
        ]
    else:
        payload = request
    with open(file_name, "w", encoding="utf-8") as file:
        json.dump(payload, file)


@router.post("/trigger", status_code=200)
async def webhook(request: GitHubPushWebhook, db:Annotated[Session, Depends(get_db)]):
    if request.head_commit is None:
        return JSONResponse(status_code=400, content={"message": "Missing head commit"})
    repo_name = request.repository.full_name
    added_modified_file_path_list = request.head_commit.added + request.head_commit.modified
    async with GithubService() as github:
        github_source_tree, github_code_changes, github_file_contents = await asyncio.gather(
            github.get_source_tree(repo_name, request.head_commit.id),
            github.get_code_changes(repo_name, request.before, request.head_commit.id),
            github.get_file_contents(repo_name, request.head_commit.id, added_modified_file_path_list),
        )
        repository = github.save_repository(db, repo_name)
    changed_files = build_changed_files(github_file_contents, github_code_changes)
    category_service = ChangeCategoryService()
    change_categories = await asyncio.gather(
        *(
            category_service.change_category(
                file["source_code"],
                file["change"],
                file["change_id"],
                file["filename"],
                github_source_tree=github_source_tree,
                repository_id=repository.id,
                commit_sha=request.head_commit.id,
                db=db,
            )
            for file in changed_files
        )
    )
    await asyncio.to_thread(write_request, "changed_files.json", changed_files)
    await asyncio.to_thread(write_request, "request.json", request.model_dump(mode="json"))
    await asyncio.to_thread(write_request, "tree.json", github_source_tree)
    return JSONResponse(status_code=200, content={"message": "Webhook received"})
