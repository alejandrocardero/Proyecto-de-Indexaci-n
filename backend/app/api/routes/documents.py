from datetime import datetime, timezone
from uuid import uuid4
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from app.core.config import settings
from app.core.dependencies import get_org_membership, require_roles
from app.db.supabase import get_supabase
from app.schemas import ReviewRequest

router = APIRouter()
ALLOWED_TYPES = {
    "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/plain",
    "image/png", "image/jpeg", "image/webp"
}

def _audit(db, org_id, user_id, action, entity_id=None, details=None):
    db.table("audit_logs").insert({
        "organization_id": org_id, "user_id": user_id, "action": action,
        "entity_type": "document", "entity_id": entity_id, "details": details or {}
    }).execute()

@router.get("")
def list_documents(
    status: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    membership=Depends(get_org_membership),
):
    db = get_supabase()
    q = db.table("documents").select("*", count="exact").eq(
        "organization_id", membership["organization_id"]
    ).is_("archived_at", "null").order("created_at", desc=True)
    if status:
        q = q.eq("review_status", status)
    result = q.range(offset, offset + limit - 1).execute()
    return {"items": result.data or [], "total": result.count or 0, "limit": limit, "offset": offset}

@router.post("", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    title: str | None = Form(default=None),
    membership=Depends(require_roles("admin", "manager", "staff")),
):
    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Formato no admitido")
    content = await file.read(settings.max_upload_bytes + 1)
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail=f"El archivo supera {settings.max_upload_mb} MB")
    if not content:
        raise HTTPException(status_code=400, detail="El archivo está vacío")

    db = get_supabase()
    org_id, user = membership["organization_id"], membership["user"]
    doc_id = str(uuid4())
    raw_name = file.filename or "archivo"
    safe_name = raw_name.replace("/", "_").replace("\\", "_").strip() or "archivo"
    storage_path = f"{org_id}/{doc_id}/{safe_name}"
    try:
        db.storage.from_(settings.supabase_storage_bucket).upload(
            storage_path, content, {"content-type": content_type, "upsert": "false"}
        )
        inserted = db.table("documents").insert({
            "id": doc_id, "organization_id": org_id, "uploaded_by": user.id,
            "title": title or file.filename, "original_filename": file.filename,
            "mime_type": content_type, "size_bytes": len(content),
            "storage_path": storage_path, "review_status": "pending",
            "indexing_status": "queued"
        }).execute()
    except Exception as exc:
        try:
            db.storage.from_(settings.supabase_storage_bucket).remove([storage_path])
        except Exception:
            pass
        raise HTTPException(status_code=502, detail="No se pudo guardar el documento") from exc
    _audit(db, org_id, user.id, "document.uploaded", doc_id,
           {"filename": file.filename, "size_bytes": len(content)})
    return inserted.data[0]

@router.get("/{document_id}")
def get_document(document_id: str, membership=Depends(get_org_membership)):
    db = get_supabase()
    result = db.table("documents").select("*").eq(
        "id", document_id
    ).eq("organization_id", membership["organization_id"]).is_("archived_at", "null").maybe_single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return result.data

@router.patch("/{document_id}/review")
def review_document(
    document_id: str, payload: ReviewRequest,
    membership=Depends(require_roles("admin", "manager")),
):
    db = get_supabase()
    org_id, user = membership["organization_id"], membership["user"]
    result = db.table("documents").update({
        "review_status": payload.status, "reviewed_by": user.id,
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "review_comment": payload.comment
    }).eq("id", document_id).eq("organization_id", org_id).is_("archived_at", "null").execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    _audit(db, org_id, user.id, f"document.{payload.status}", document_id, {"comment": payload.comment})
    return result.data[0]

@router.delete("/{document_id}", status_code=204)
def archive_document(document_id: str, membership=Depends(require_roles("admin", "manager"))):
    db = get_supabase()
    org_id, user = membership["organization_id"], membership["user"]
    result = db.table("documents").update({
        "archived_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", document_id).eq("organization_id", org_id).is_("archived_at", "null").execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    _audit(db, org_id, user.id, "document.archived", document_id)
