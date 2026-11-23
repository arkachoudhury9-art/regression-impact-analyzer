from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    change_ids: list[int] = Field(min_length=1)


class ChangedFileResponse(BaseModel):
    file_path: str
    file_content: str
    diff_content: str
    criticality: str


class RegressionRiskResponse(BaseModel):
    risk: str
    reason: str
    affected_area: str
    severity: str


class AnalysisResponse(BaseModel):
    change_summary: str
    regression_risks: list[RegressionRiskResponse]
    changed_files: list[ChangedFileResponse]
