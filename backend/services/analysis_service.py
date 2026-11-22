from agents.graph import graph
from agents.state import ChangedFile, RegressionState
from models.change import Change


class AnalysisService:
    async def analyze(self, changes: list[Change]) -> dict:
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
        print(result)
        return {
            "changed_files": changed_files,
            "change_summary": result["change_summary"],
            "regression_risks": result["regression_risks"],
            "security_risks": result["security_risks"],
            "analysis_level": result["analysis_level"],
        }
