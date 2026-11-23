from typing import Literal, TypedDict


class ChangedFile(TypedDict):
    file_path: str
    file_content: str
    diff_content: str
    criticality: str

class RegressionRisk(TypedDict):
    risk: str
    reason: str
    affected_area: str
    severity: str

class RegressionState(TypedDict):
    changed_files: list[ChangedFile]
    change_summary: str
    regression_risks: list[RegressionRisk]
    security_risks: list[str]
    analysis_level: Literal['high', 'medium', 'low']
