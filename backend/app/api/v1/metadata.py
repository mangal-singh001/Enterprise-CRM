from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.registry import registry
from app.core.security import get_current_user, verify_product_permission

router = APIRouter()

@router.get("/products")
def list_authorized_products(current_user: dict = Depends(get_current_user)):
    """
    Returns list of products available in the CRM platform filtered by the employee's authorization permissions.
    """
    all_products = registry.get_products()
    authorized = []
    
    for prod in all_products:
        if verify_product_permission(current_user, prod.id):
            prod_dict = prod.model_dump()
            prod_dict["authorized"] = True
            authorized.append(prod_dict)
        else:
            # Optionally include unauthorized products marked as unauthorized for UI visibility
            prod_dict = prod.model_dump()
            prod_dict["authorized"] = False
            authorized.append(prod_dict)
            
    return authorized

@router.get("/products/{product_id}")
def get_product_schema(product_id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieves full schema metadata for a specific product and its registered entities.
    """
    if not verify_product_permission(current_user, product_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied to product workspace '{product_id}'."
        )
        
    product = registry.get_product(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{product_id}' not found in CRM entity registry."
        )
    return product.model_dump()

@router.get("/entities/{product_id}/{entity_id}")
def get_entity_schema(product_id: str, entity_id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieves dynamic schema and UI configuration for a specific entity.
    """
    if not verify_product_permission(current_user, product_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    entity = registry.get_entity(product_id, entity_id)
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity '{entity_id}' not found under product '{product_id}'."
        )
    return entity.model_dump()
