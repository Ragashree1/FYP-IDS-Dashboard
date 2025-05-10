from database import SessionLocal
from models.models import MLModels
from models.schemas import MLModelBase, MLModelOut
from typing import Optional, List

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