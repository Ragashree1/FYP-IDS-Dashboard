from database import SessionLocal
from models.models import MLModels
from models.schemas import MLModelBase, MLModelOut
from typing import Optional, List
import os

def add_model(model_data: MLModelBase) -> MLModelOut:
    with SessionLocal() as db:
        db_model = MLModels(**model_data.model_dump())
        db.add(db_model)
        db.commit()
        db.refresh(db_model)
        return MLModelOut.model_validate(db_model)

def remove_model(model_id: int) -> bool:
    with SessionLocal() as db:
        model = db.query(MLModels).filter(MLModels.id == model_id).first()
        if model:
            # Delete associated files
            if os.path.exists(model.model_file_path):
                os.remove(model.model_file_path)
            if model.preprocessor_file_path and os.path.exists(model.preprocessor_file_path):
                os.remove(model.preprocessor_file_path)
            
            db.delete(model)
            db.commit()
            return True
        return False

def set_model_status(model_id: int, organization_id: int, is_active: bool) -> Optional[MLModelOut]:
    with SessionLocal() as db:
        # Ensure only one model is active per organization
        if is_active:
            db.query(MLModels).filter(
                MLModels.organization_id == organization_id,
                MLModels.is_active == True
            ).update({"is_active": False})

        model = db.query(MLModels).filter(MLModels.id == model_id).first()
        if model:
            model.is_active = is_active
            db.commit()
            db.refresh(model)
            return MLModelOut.model_validate(model)
        return None

def get_models_by_organization(organization_id: int) -> List[MLModelOut]:
    with SessionLocal() as db:
        models = db.query(MLModels).filter(MLModels.organization_id == organization_id).all()
        return [MLModelOut.model_validate(model) for model in models]

def update_model(
    model_id: int,
    model_data: MLModelBase,
    new_model_file: Optional[str] = None,
    new_preprocessor_file: Optional[str] = None
) -> Optional[MLModelOut]:
    with SessionLocal() as db:
        model = db.query(MLModels).filter(MLModels.id == model_id).first()
        if not model:
            return None

        # Update basic fields
        for field, value in model_data.model_dump(exclude_unset=True).items():
            setattr(model, field, value)

        # Update files if provided
        if new_model_file:
            # Delete old model file
            if os.path.exists(model.model_file_path):
                os.remove(model.model_file_path)
            model.model_file_path = new_model_file
            model.model_file_name = os.path.basename(new_model_file)

        if new_preprocessor_file:
            # Delete old preprocessor file
            if model.preprocessor_file_path and os.path.exists(model.preprocessor_file_path):
                os.remove(model.preprocessor_file_path)
            model.preprocessor_file_path = new_preprocessor_file
            model.preprocessor_file_name = os.path.basename(new_preprocessor_file)

        db.commit()
        db.refresh(model)
        return MLModelOut.model_validate(model)
    
def get_model_by_id(model_id: int) -> Optional[MLModelOut]:
    with SessionLocal() as db:
        model = db.query(MLModels).filter(MLModels.id == model_id).first()
        if model:
            return MLModelOut.model_validate(model)
        return None