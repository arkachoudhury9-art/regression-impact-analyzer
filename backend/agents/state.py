from typing import Literal, TypedDict


class ChangedFile(TypedDict):
    file_path: str
    file_content: str
    diff_content: str
    criticality: str

class RegressionState(TypedDict):
    changed_files: list[ChangedFile]
    change_summary: str
    regression_risks: list[str]
    security_risks: list[str]
    analysis_level: Literal['high', 'medium', 'low']
