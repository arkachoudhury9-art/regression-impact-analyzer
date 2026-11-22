from datetime import datetime

from models.change import Criticality
from pydantic import BaseModel


class ChangeResponse(BaseModel):
    id: int
    change_id: str | None
    category: str | None
    criticality: Criticality | None
    file_name: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
