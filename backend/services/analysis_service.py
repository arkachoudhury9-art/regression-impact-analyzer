import io
import logging
import shutil
import tempfile
import zipfile
from pathlib import Path

from agents.graph import graph
from agents.state import ChangedFile, RegressionState
from models.change import Change

from services.github_service import GithubService

logger = logging.getLogger(__name__)

class AnalysisService:
    async def analyze(self, changes: list[Change]) -> dict:
        changes = sorted(changes, key=lambda change: change.created_at)
        if changes:
            latest = changes[-1]
            repo_name = latest.repository.name if latest.repository is not None else None
            print(latest.commit_sha)
            print(repo_name)
            if latest.commit_sha and repo_name:
                async with GithubService() as github:
                    snapshot = await github.get_repository_snapshot(repo_name, latest.commit_sha)
                snapshot_dir = Path(tempfile.gettempdir()) / "repo-snapshot" / repo_name
                if snapshot_dir.exists():
                    shutil.rmtree(snapshot_dir)
                snapshot_dir.mkdir(parents=True)
                with zipfile.ZipFile(io.BytesIO(snapshot)) as archive:
                    archive.extractall(snapshot_dir)
                logger.info(f"Repository snapshot saved to: {snapshot_dir}")
        changed_files: list[ChangedFile] = [
            {
                "file_path": change.file_name or "",
                "file_content": change.source.source,
                "diff_content": change.source.diff,
                "criticality": change.criticality.value if change.criticality else "",
            }
            for change in changes
        ]
        state: RegressionState = {
            "changed_files": changed_files,
            "change_summary": "",
            "regression_risks": [],
            "security_risks": [],
            "analysis_level": "low",
        }
        result = await graph.ainvoke(state)
        return {
            "changed_files": changed_files,
            "change_summary": result["change_summary"],
            "regression_risks": result["regression_risks"],
            "security_risks": result["security_risks"],
            "analysis_level": result["analysis_level"],
        }
