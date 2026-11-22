from base64 import b64decode
from typing import TypedDict

from schemas.github import GitCodeChanges, GitFileContent


class ChangedFile(TypedDict):
    change_id: str
    filename: str
    source_code: str
    change: str


def decode_base64_content(content: str) -> str:
    return b64decode(content).decode("utf-8")


def build_changed_files(
    file_contents: list[GitFileContent],
    code_changes: GitCodeChanges,
) -> list[ChangedFile]:
    changes_by_filename = {
        changed_file.filename: changed_file.patch or ""
        for changed_file in code_changes.files
    }
    return [
        {
            "change_id": file_content.sha,
            "filename": file_content.path,
            "source_code": decode_base64_content(file_content.content or ""),
            "change": changes_by_filename.get(file_content.path, ""),
        }
        for file_content in file_contents
    ]