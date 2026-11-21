from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field

ReviewStatus = Literal["pending", "approved", "rejected"]
IndexingStatus = Literal["queued", "processing", "indexed", "error"]

class ReviewRequest(BaseModel):
    status: Literal["approved", "rejected"]
    comment: str | None = Field(default=None, max_length=2000)

class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=2000)
    filters: dict = Field(default_factory=dict)
    limit: int = Field(default=10, ge=1, le=50)
    offset: int = Field(default=0, ge=0)

class MemberRoleUpdate(BaseModel):
    role: Literal["admin", "manager", "staff", "viewer"]

class DocumentOut(BaseModel):
    id: str
    organization_id: str
    title: str
    original_filename: str
    mime_type: str
    size_bytes: int
    review_status: str
    indexing_status: str
    created_at: datetime | str
