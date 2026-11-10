from dataclasses import dataclass
from typing import Any
from fastapi import Depends, Header, HTTPException
from app.core.security import decode_supabase_token
from app.db.supabase import get_supabase

@dataclass
class CurrentUser:
    id: str
    email: str | None
    claims: dict[str, Any]

def get_current_user(authorization: str | None = Header(default=None)) -> CurrentUser:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Se requiere Authorization: Bearer <token>")
    claims = decode_supabase_token(authorization.split(" ", 1)[1].strip())
    return CurrentUser(id=str(claims["sub"]), email=claims.get("email"), claims=claims)

def get_org_membership(
    x_org_id: str = Header(alias="X-Organization-Id"),
    user: CurrentUser = Depends(get_current_user),
):
    db = get_supabase()
    result = db.table("org_members").select("role,organization_id").eq(
        "organization_id", x_org_id
    ).eq("user_id", user.id).eq("is_active", True).maybe_single().execute()
    if not result.data:
        raise HTTPException(status_code=403, detail="No perteneces a esta organización")
    return {"organization_id": x_org_id, "role": result.data["role"], "user": user}

def require_roles(*roles: str):
    def dependency(membership=Depends(get_org_membership)):
        if membership["role"] not in roles:
            raise HTTPException(status_code=403, detail="No tienes permisos para esta operación")
        return membership
    return dependency
