from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Body
from services import ml_model_service
from models.schemas import MLModelBase, MLModelOut
from typing import List
import os
import shutil

router = APIRouter(prefix="/ml_model", tags=["ml_model"])

UPLOAD_DIR = "/home/raga/logIntegration/uploads/ml_models"

@router.post("/", response_model=MLModelOut)
def create_model(
    model_name: str = Form(...),
    algorithm: str = Form(...),
    organization_id: int = Form(...),
    file: UploadFile = File(...)
):
    # Save the uploaded file
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Add model to the database
    model = ml_model_service.add_model(
        model_data=MLModelBase(
            model_name=model_name,
            algorithm=algorithm,
            file_path=file_path,
            file_name=file.filename,  # Pass the file name
            organization_id=organization_id
        )
    )
    return model
@router.get("/", response_model=List[MLModelOut])
def get_models_by_organization(organization_id: int):
    models = ml_model_service.get_models_by_organization(organization_id=organization_id)
    if models is None:
        return []
    return models

@router.delete("/{model_id}")
def remove_model(model_id: int):
    success = ml_model_service.remove_model(model_id=model_id)
    if not success:
        raise HTTPException(status_code=404, detail="Model not found.")
    return {"message": "Model deleted successfully"}


@router.put("/{model_id}/status")
def update_model_status(
    model_id: int, 
    organization_id: int = Body(...), 
    is_active: bool = Body(...)
):
    updated_model = ml_model_service.set_model_status(
        model_id=model_id,
        organization_id=organization_id,
        is_active=is_active
    )
    if not updated_model:
        raise HTTPException(status_code=404, detail="Model not found.")
    return updated_model