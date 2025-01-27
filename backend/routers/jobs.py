from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Job

router = APIRouter()

@router.get("/jobs/")
def get_jobs(skip: int = 0, limit: int = 30, db: Session = Depends(get_db)):
    jobs = db.query(Job).offset(skip).limit(limit).all()
    return jobs
