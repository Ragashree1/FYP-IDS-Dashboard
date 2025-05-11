from datetime import datetime
import json
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Body
from services import ml_model_service
from models.schemas import MLModelBase, MLModelOut
from typing import List, Optional
import os
import shutil

router = APIRouter(prefix="/ml_model", tags=["ml_model"])

UPLOAD_DIR = "/home/raga/logIntegration/uploads/ml_models"

@router.post("/", response_model=MLModelOut)
def create_model(
    model_name: str = Form(...),
    algorithm: str = Form(...),
    model_type: str = Form(...),  # 'anomaly' or 'multiclass'
    organization_id: int = Form(...),
    model_file: UploadFile = File(...),
    preprocessor_file: Optional[UploadFile] = File(None),
    use_default_preprocessor: str = Form("false"),  # Accept as string
    has_built_in_preprocessor: str = Form("false"), # Accept as string
    label_mapping: Optional[str] = Form(None),
    features_list: Optional[str] = Form(None),
    use_default_features: str = Form("false") 
):
    
    #before
    print("before")
    print("has_built_in_preprocessor:", has_built_in_preprocessor, "| type:", type(has_built_in_preprocessor))
    print("use_default_preprocessor:", use_default_preprocessor, "| type:", type(use_default_preprocessor))
    print("use_default_features:", use_default_features, "| type:", type(use_default_features))
    use_default_preprocessor = str(use_default_preprocessor).lower() == 'true'
    has_built_in_preprocessor = str(has_built_in_preprocessor).lower() == 'true'
    use_default_features = str(use_default_features).lower() == 'true'

    # Create organization directory if it doesn't exist
    org_upload_dir = os.path.join(UPLOAD_DIR, str(organization_id))
    os.makedirs(org_upload_dir, exist_ok=True)
    
    # Generate timestamp for unique filenames
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save model file
    model_filename = f"{timestamp}_model.pkl"
    model_path = os.path.join(org_upload_dir, model_filename)
    with open(model_path, "wb") as buffer:
        shutil.copyfileobj(model_file.file, buffer)

    # Save preprocessor file if provided
    preprocessor_filename = None
    preprocessor_path = None
    if preprocessor_file and not use_default_preprocessor and not has_built_in_preprocessor:
        preprocessor_filename = f"{timestamp}_preprocessor.pkl"
        preprocessor_path = os.path.join(org_upload_dir, preprocessor_filename)
        with open(preprocessor_path, "wb") as buffer:
            shutil.copyfileobj(preprocessor_file.file, buffer)
    print("after")
    print("has_built_in_preprocessor:", has_built_in_preprocessor, "| type:", type(has_built_in_preprocessor))
    print("use_default_preprocessor:", use_default_preprocessor, "| type:", type(use_default_preprocessor))
    print("use_default_features:", use_default_features, "| type:", type(use_default_features))


    # Parse label mapping if provided
    label_mapping_dict = None
    if label_mapping and model_type == "multiclass":
        try:
            label_mapping_dict = json.loads(label_mapping)
            if not isinstance(label_mapping_dict, dict):
                raise HTTPException(
                    status_code=400,
                    detail="Label mapping must be a valid JSON object"
                )
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Invalid JSON format for label mapping"
            )


    # Add model to database
    model = ml_model_service.add_model(
        model_data=MLModelBase(
            model_name=model_name,
            algorithm=algorithm,
            model_type=model_type,
            model_file_name=model_filename,
            model_file_path=model_path,
            preprocessor_file_name=preprocessor_filename,
            preprocessor_file_path=preprocessor_path,
            use_default_preprocessor=use_default_preprocessor,
            has_built_in_preprocessor=has_built_in_preprocessor,
            label_mapping=label_mapping_dict,
            features_list=features_list if not use_default_features else None,
            use_default_features=use_default_features,
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

@router.put("/{model_id}", response_model=MLModelOut)
async def update_model(
    model_id: int,
    model_name: str = Form(...),
    algorithm: str = Form(...),
    model_type: str = Form(...),
    organization_id: int = Form(...),
    model_file: Optional[UploadFile] = File(None),
    preprocessor_file: Optional[UploadFile] = File(None),
    use_default_preprocessor: str = Form("false"),
    has_built_in_preprocessor: str = Form("false"),
    label_mapping: Optional[str] = Form(None),
    features_list: Optional[str] = Form(None),
    use_default_features: str = Form("false"),
    normal_class_name: Optional[str] = Form(None)
):
    # Get existing model first
    existing_model = ml_model_service.get_model_by_id(model_id)
    if not existing_model:
        raise HTTPException(status_code=404, detail="Model not found")

    # Convert string booleans to actual booleans
    use_default_preprocessor = str(use_default_preprocessor).lower() == 'true'
    has_built_in_preprocessor = str(has_built_in_preprocessor).lower() == 'true'
    use_default_features = str(use_default_features).lower() == 'true'

    # Handle file uploads if provided
    new_model_path = None
    new_model_filename = None
    new_preprocessor_path = None
    new_preprocessor_filename = None

    if model_file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        org_upload_dir = os.path.join(UPLOAD_DIR, str(organization_id))
        os.makedirs(org_upload_dir, exist_ok=True)
        
        new_model_filename = f"{timestamp}_model.pkl"
        new_model_path = os.path.join(org_upload_dir, new_model_filename)
        with open(new_model_path, "wb") as buffer:
            shutil.copyfileobj(model_file.file, buffer)

    if preprocessor_file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        org_upload_dir = os.path.join(UPLOAD_DIR, str(organization_id))
        new_preprocessor_filename = f"{timestamp}_preprocessor.pkl"
        new_preprocessor_path = os.path.join(org_upload_dir, new_preprocessor_filename)
        with open(new_preprocessor_path, "wb") as buffer:
            shutil.copyfileobj(preprocessor_file.file, buffer)

    # Parse label mapping if provided
    label_mapping_dict = None
    if label_mapping and model_type == "multiclass":
        try:
            label_mapping_dict = json.loads(label_mapping)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format for label mapping")

    # Update model
    updated_model = ml_model_service.update_model(
        model_id=model_id,
        model_data=MLModelBase(
            model_name=model_name,
            algorithm=algorithm,
            model_type=model_type,
            # Keep existing file info if no new files are uploaded
            model_file_name=new_model_filename or existing_model.model_file_name,
            model_file_path=new_model_path or existing_model.model_file_path,
            preprocessor_file_name=new_preprocessor_filename or existing_model.preprocessor_file_name,
            preprocessor_file_path=new_preprocessor_path or existing_model.preprocessor_file_path,
            use_default_preprocessor=use_default_preprocessor,
            has_built_in_preprocessor=has_built_in_preprocessor,
            label_mapping=label_mapping_dict or existing_model.label_mapping,
            features_list=features_list if not use_default_features else existing_model.features_list,
            use_default_features=use_default_features,
            organization_id=organization_id,
            normal_class_name=normal_class_name
        ),
        new_model_file=new_model_path,
        new_preprocessor_file=new_preprocessor_path
    )

    if not updated_model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return updated_model