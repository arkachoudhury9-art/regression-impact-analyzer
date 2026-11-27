from pydantic import BaseModel, ConfigDict, Field


class GitHubModel(BaseModel):
    model_config = ConfigDict(extra="allow")


class GitHubUser(GitHubModel):
    login: str
    id: int


class GitHubRepository(GitHubModel):
    id: int
    name: str
    full_name: str
    private: bool
    default_branch: str

class RepositoryBranchesResponse(BaseModel):
    repository_name: str
    branches: list[str]


class GitHubPusher(GitHubModel):
    name: str
    email: str | None = None


class GitHubCommitAuthor(GitHubModel):
    name: str
    email: str
    username: str | None = None


class GitHubCommit(GitHubModel):
    id: str
    tree_id: str
    distinct: bool
    message: str
    timestamp: str
    url: str
    author: GitHubCommitAuthor
    committer: GitHubCommitAuthor
    added: list[str]
    removed: list[str]
    modified: list[str]


class GitHubPushWebhook(GitHubModel):
    ref: str
    before: str
    after: str
    repository: GitHubRepository
    pusher: GitHubPusher
    sender: GitHubUser
    created: bool
    deleted: bool
    forced: bool
    base_ref: str | None = None
    compare: str
    commits: list[GitHubCommit]
    head_commit: GitHubCommit | None = None


class GitTreeEntry(GitHubModel):
    path: str
    mode: str
    type: str
    sha: str
    size: int | None = None
    url: str


class GitSourceTree(GitHubModel):
    sha: str
    url: str
    tree: list[GitTreeEntry]
    truncated: bool


class GitChangedFile(GitHubModel):
    sha: str | None = None
    filename: str
    status: str
    additions: int
    deletions: int
    changes: int
    blob_url: str | None = None
    raw_url: str | None = None
    contents_url: str | None = None
    patch: str | None = None
    previous_filename: str | None = None


class GitCodeChanges(GitHubModel):
    url: str
    html_url: str
    status: str
    ahead_by: int
    behind_by: int
    total_commits: int
    files: list[GitChangedFile]


class GitContentLinks(GitHubModel):
    self: str
    git: str | None = None
    html: str | None = None


class GitFileContent(GitHubModel):
    name: str
    path: str
    sha: str
    size: int
    url: str
    html_url: str | None = None
    git_url: str | None = None
    download_url: str | None = None
    type: str
    content: str | None = None
    encoding: str | None = None
    links: GitContentLinks = Field(alias="_links")
