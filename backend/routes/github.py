import re
from typing import Annotated
from urllib.parse import urlsplit

from fastapi import APIRouter, HTTPException, Query
from schemas.github import RepositoryBranchesResponse
from services.github_service import GithubService

router = APIRouter(prefix="/github", tags=["github"])
REPOSITORY_PART_PATTERN = re.compile(r"^[A-Za-z0-9_.-]+$")


def parse_github_repository_url(repository_url: str) -> str:
    try:
        parsed_url = urlsplit(repository_url.strip())
        has_port = parsed_url.port is not None
    except ValueError as error:
        raise HTTPException(status_code=400, detail="Enter a valid GitHub repository URL") from error

    if (
        parsed_url.scheme.lower() != "https"
        or parsed_url.hostname is None
        or parsed_url.hostname.lower() != "github.com"
        or parsed_url.username is not None
        or parsed_url.password is not None
        or has_port
        or parsed_url.query
        or parsed_url.fragment
    ):
        raise HTTPException(
            status_code=400,
            detail="Only HTTPS GitHub.com repository URLs are supported",
        )

    path_parts = parsed_url.path.strip("/").split("/")
    if len(path_parts) != 2:
        raise HTTPException(
            status_code=400,
            detail="Use a repository URL in the format https://github.com/owner/repository",
        )

    owner, repository = path_parts
    if repository.lower().endswith(".git"):
        repository = repository[:-4]

    if not all(REPOSITORY_PART_PATTERN.fullmatch(part) for part in (owner, repository)):
        raise HTTPException(status_code=400, detail="The GitHub repository URL contains an invalid owner or name")

    return f"{owner}/{repository}"


@router.get("/branches", response_model=RepositoryBranchesResponse)
async def list_repository_branches(
    repository_url: Annotated[str, Query(min_length=1)],
) -> RepositoryBranchesResponse:
    repository_name = parse_github_repository_url(repository_url)
    async with GithubService() as github:
        try:
            branches = await github.get_branches(repository_name)
        except HTTPException as error:
            if error.status_code == 404:
                raise HTTPException(
                    status_code=404,
                    detail="Repository not found or not accessible. Check the URL and GitHub API permissions.",
                ) from error
            raise

    return RepositoryBranchesResponse(repository_name=repository_name, branches=branches)
