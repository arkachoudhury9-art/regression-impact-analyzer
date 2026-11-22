from typing import Annotated

from db.database import get_db
from fastapi import APIRouter, Depends
from models.change import Change
from schemas.change import ChangeResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

router = APIRouter(prefix="/change", tags=["change"])


@router.get("/", response_model=list[ChangeResponse])
def get_changes(db: Annotated[Session, Depends(get_db)]) -> list[Change]:
    return list(db.scalars(select(Change).order_by(Change.created_at.desc())))
