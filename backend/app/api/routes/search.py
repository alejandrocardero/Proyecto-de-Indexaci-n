from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_org_membership
from app.schemas import SearchRequest
router = APIRouter()

@router.post("")
def search_documents(payload: SearchRequest, membership=Depends(get_org_membership)):
    # Contrato estable para el frontend. La implementación real depende del esquema
    # de colecciones, propiedades, tenant y estrategia híbrida que entregue Nelson.
    raise HTTPException(
        status_code=503,
        detail={
            "code": "SEARCH_PROVIDER_NOT_READY",
            "message": "El motor de búsqueda todavía no está conectado. Pendiente de la integración Weaviate."
        }
    )
