from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import JobSeeker, AppliedJob
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

@router.post("/apply-job/")
def apply_job(seeker_id: int, job_id: int, db: Session = Depends(get_db)):
    # Check if already applied
    if db.query(AppliedJob).filter_by(seeker_id=seeker_id, job_id=job_id).first():
        raise HTTPException(status_code=400, detail="Already applied to this job.")

    # Create a new AppliedJob entry
    applied_job = AppliedJob(seeker_id=seeker_id, job_id=job_id)
    db.add(applied_job)
    db.commit()
    return {"message": "Successfully applied for the job."}

@router.get("/applied-jobs/{seeker_id}")
def get_applied_jobs(seeker_id: int, db: Session = Depends(get_db)):
    applied_jobs = db.query(AppliedJob).filter_by(seeker_id=seeker_id).all()
    return [{"job_id": aj.job.job_id, "job_title": aj.job.job_title, "country": aj.job.country} for aj in applied_jobs]


