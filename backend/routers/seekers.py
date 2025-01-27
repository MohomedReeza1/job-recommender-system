from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import JobSeeker
from schemas import JobSeekerCreate, JobSeekerResponse

router = APIRouter()

@router.post("/seekers/", response_model=JobSeekerResponse)
def create_job_seeker(seeker: JobSeekerCreate, db: Session = Depends(get_db)):
    # Convert Pydantic model to SQLAlchemy model
    new_seeker = JobSeeker(**seeker.dict())
    db.add(new_seeker)
    db.commit()
    db.refresh(new_seeker)
    return new_seeker
