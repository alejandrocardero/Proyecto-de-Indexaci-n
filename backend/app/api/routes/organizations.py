from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.db.supabase import get_supabase
router = APIRouter()

@router.get("")
def list_organizations(user=Depends(get_current_user)):
    db = get_supabase()
    rows = db.table("org_members").select(
        "role,is_active,organizations(id,name,slug)"
    ).eq("user_id", user.id).eq("is_active", True).execute()
    return {"items": [
        {"id": row["organizations"]["id"], "name": row["organizations"]["name"],
         "slug": row["organizations"].get("slug"), "role": row["role"]}
        for row in (rows.data or []) if row.get("organizations")
    ]}
