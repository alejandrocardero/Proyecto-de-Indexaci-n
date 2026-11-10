from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import require_roles
from app.db.supabase import get_supabase
from app.schemas import MemberRoleUpdate
router = APIRouter()

@router.get("/{organization_id}/members")
def list_members(organization_id: str, membership=Depends(require_roles("admin", "manager"))):
    if organization_id != membership["organization_id"]:
        raise HTTPException(status_code=403, detail="Organización no autorizada")
    result = get_supabase().table("org_members").select(
        "user_id,role,is_active,created_at"
    ).eq("organization_id", organization_id).order("created_at").execute()
    return {"items": result.data or []}

@router.patch("/{organization_id}/members/{user_id}")
def update_member_role(
    organization_id: str, user_id: str, payload: MemberRoleUpdate,
    membership=Depends(require_roles("admin")),
):
    if organization_id != membership["organization_id"]:
        raise HTTPException(status_code=403, detail="Organización no autorizada")
    result = get_supabase().table("org_members").update({"role": payload.role}).eq(
        "organization_id", organization_id
    ).eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    return result.data[0]
