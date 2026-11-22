from typing import Annotated

from db.database import get_db
from fastapi import APIRouter, Depends, status
from models.change import Change
from schemas.analysis import AnalysisRequest, AnalysisResponse
from services.analysis_service import AnalysisService
from sqlalchemy import select
from sqlalchemy.orm import Session

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/", response_model=AnalysisResponse, status_code=status.HTTP_200_OK)
async def generate_analysis(db: Annotated[Session, Depends(get_db)], request: AnalysisRequest) -> AnalysisResponse:
    changes = list(db.scalars(select(Change).where(Change.id.in_(request.change_ids))))
    result = await AnalysisService().analyze(changes)
    return AnalysisResponse(
        change_summary=result["change_summary"],
        regression_risks=result["regression_risks"],
        changed_files=result["changed_files"],
    )
