from fastapi import APIRouter, Depends, Query
from app.core.dependencies import require_roles
from app.db.supabase import get_supabase
router = APIRouter()

@router.get("")
def list_audit_logs(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    membership=Depends(require_roles("admin", "manager")),
):
    result = get_supabase().table("audit_logs").select("*", count="exact").eq(
        "organization_id", membership["organization_id"]
    ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return {"items": result.data or [], "total": result.count or 0, "limit": limit, "offset": offset}
