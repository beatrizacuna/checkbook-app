from fastapi import FastAPI, HTTPException, Depends
from typing import List, Annotated, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app import models
from app.config import engine, SessionLocal
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

class CheckBase(BaseModel):
    check_number: int = Field(ge=0)

class CheckBookBase(BaseModel):
    bank_name: str = Field(min_length=1)
    min_range: int = Field(ge=0)
    max_range: int = Field(ge=0)
    checks: Optional[List[CheckBase]] = None

class CheckbookModel(CheckBookBase):
    id: int

    class Config:
        orm_mode = True

@app.get("/")
async def Home():
    return "Welcome Home"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session,Depends(get_db)]

models.Base.metadata.create_all(bind=engine)

@app.post("/checkbooks/", response_model=CheckbookModel)
async def create_checkbook(checkbook: CheckBookBase, db: db_dependency):
    if checkbook.min_range >= checkbook.max_range:
        raise HTTPException(status_code=400, detail="El rango mínimo debe ser menor que el rango máximo.")

    if checkbook.max_range - checkbook.min_range > 30:
        raise HTTPException(status_code=400, detail="La diferencia entre los rangos no debe exceder los 30 valores.")
    
    new_checkbook = models.CheckBook(**checkbook.dict())
    db.add(new_checkbook)
    db.commit()
    db.refresh(new_checkbook)
    return new_checkbook

@app.get("/checkbooks/{checkbook_id}")
async def get_checkbook(checkbook_id: int, db: db_dependency):
    checkbook = db.query(models.CheckBook).filter(models.CheckBook.id == checkbook_id).first()
    if checkbook is None:
        raise HTTPException(status_code=404, detail="Checkbook not found")
    return checkbook

@app.get("/checkbooks/", response_model=List[CheckbookModel])
async def get_checkbook(db: db_dependency, skip: int = 0, limit: int = 100):
    checkbooks = db.query(models.CheckBook).offset(skip).limit(limit).all()
    return checkbooks

@app.get("/complete-checkbooks")
async def get_checkbook(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    checkbooks = db.query(models.CheckBook).offset(skip).limit(limit).all()
    complete_checkbooks = [checkbook for checkbook in checkbooks if is_complete_checkbook(db, checkbook)]

    return complete_checkbooks

def is_complete_checkbook(db: Session, checkbook: models.CheckBook) -> bool:
    checks = checkbook.checks
    count_checks_in_range = sum(1 for check in checks if checkbook.min_range <= check.check_number <= checkbook.max_range)
    return count_checks_in_range == (checkbook.max_range - checkbook.min_range + 1)

@app.put("/checkbooks/{checkbook_id}")
async def update_checkbook(checkbook_id: int, checkbook: CheckBookBase, db: db_dependency):
    _checkbook = db.query(models.CheckBook).filter(models.CheckBook.id == checkbook_id).first()
    if _checkbook is None:
        raise HTTPException(status_code=404, detail="Checkbook not found")
    _checkbook.bank_name = checkbook.bank_name
    _checkbook.min_range = checkbook.min_range
    _checkbook.max_range = checkbook.max_range
    db.commit()
    db.refresh(_checkbook)
    return _checkbook

@app.delete("/checkbooks/{checkbook_id}")
async def delete_checkbook(checkbook_id: int, db: db_dependency):
    checkbook = db.query(models.CheckBook).filter(models.CheckBook.id == checkbook_id).first()
    if checkbook is None:
        raise HTTPException(status_code=404, detail="Checkbook not found")
    db.delete(checkbook)
    db.commit()
    return {"message": "Checkbook deleted successfully"}

@app.get("/{checkbook_id}/checks")
async def read_checks(checkbook_id: int, db: db_dependency):
    result = db.query(models.Check).filter(models.Check.checkbook_id == checkbook_id).all()
    if not result:
        raise HTTPException(status_code=404, detail="Checks not found")
    return result

@app.post("/{checkbook_id}/checks")
async def create_check(checkbook_id: int, check: CheckBase, db: db_dependency):
    checkbook = db.query(models.CheckBook).filter(models.CheckBook.id == checkbook_id).first()
    if checkbook is None:
        raise HTTPException(status_code=404, detail="Checkbook not found")
    
    existing_check = db.query(models.Check).filter(
        models.Check.checkbook_id == checkbook_id,
        models.Check.check_number == check.check_number
    ).first()

    if existing_check:
        raise HTTPException(status_code=400, detail="Check number already exists in this checkbook")

    if check.check_number < checkbook.min_range or check.check_number > checkbook.max_range:
        raise HTTPException(status_code=400, detail="Check number out of range")
    
    new_check = models.Check(check_number=check.check_number, checkbook_id=checkbook_id)
    checkbook.checks.append(new_check)

    db.add(new_check)
    db.commit()
    db.refresh(new_check)
    return new_check

@app.put("/{checkbook_id}/checks/{check_id}")
async def update_check(checkbook_id: int, check_id: int, check: CheckBase, db: db_dependency):
    checkbook = db.query(models.CheckBook).filter(models.CheckBook.id == checkbook_id).first()
    if checkbook is None:
        raise HTTPException(status_code=404, detail="Checkbook not found")

    # Verificar si el cheque existe
    existing_check = db.query(models.Check).filter(models.Check.id == check_id, models.Check.checkbook_id == checkbook_id).first()
    if existing_check is None:
        raise HTTPException(status_code=404, detail="Check not found")

    # Verificar si el nuevo número de cheque ya existe en la chequera
    check_with_same_number = db.query(models.Check).filter(models.Check.checkbook_id == checkbook_id, models.Check.check_number == check.check_number).first()
    if check_with_same_number and check_with_same_number.id != existing_check.id:
        raise HTTPException(status_code=422, detail="Check with the same number already exists in the checkbook")

    # Actualizar los campos del cheque existente
    existing_check.check_number = check.check_number  # Aquí actualizas el número de cheque
    # Puedes actualizar otros campos si es necesario

    db.commit()
    db.refresh(existing_check)
    return existing_check

@app.delete("/{checkbook_id}/checks/{check_id}")
async def delete_check(checkbook_id: int, check_id: int, db: db_dependency):
    checkbook = db.query(models.CheckBook).filter(models.CheckBook.id == checkbook_id).first()
    if checkbook is None:
        raise HTTPException(status_code=404, detail="Checkbook not found")

    # Verificar si el cheque existe
    check_to_delete = db.query(models.Check).filter(models.Check.id == check_id, models.Check.checkbook_id == checkbook_id).first()
    if check_to_delete is None:
        raise HTTPException(status_code=404, detail="Check not found")

    # Eliminar el cheque
    db.delete(check_to_delete)
    db.commit()

    return {"message": "Check deleted successfully"}
