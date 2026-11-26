from typing import Annotated

from db.database import get_db
from fastapi import APIRouter, Depends
from models.change import Change
from schemas.change import ChangeResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/change", tags=["change"])


@router.get("/", response_model=list[ChangeResponse])
async def get_changes(db: Annotated[AsyncSession, Depends(get_db)]) -> list[Change]:
    result = await db.scalars(select(Change).order_by(Change.created_at.desc()))
    return list(result.all())
