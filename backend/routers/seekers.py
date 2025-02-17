from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import JobSeeker, AppliedJob
from schemas import JobSeekerCreate, JobSeekerResponse
from routers.auth import require_role

router = APIRouter()

@router.post("/seekers/", response_model=JobSeekerResponse, dependencies=[Depends(require_role("job_seeker"))])
def create_job_seeker(seeker: JobSeekerCreate, db: Session = Depends(get_db)):
    new_seeker = JobSeeker(**seeker.dict())
    db.add(new_seeker)
    db.commit()
    db.refresh(new_seeker)
    return new_seeker

@router.post("/apply-job/", dependencies=[Depends(require_role("job_seeker"))])
def apply_job(seeker_id: int, job_id: int, db: Session = Depends(get_db)):
    if db.query(AppliedJob).filter_by(seeker_id=seeker_id, job_id=job_id).first():
        raise HTTPException(status_code=400, detail="Already applied to this job.")
    applied_job = AppliedJob(seeker_id=seeker_id, job_id=job_id)
    db.add(applied_job)
    db.commit()
    return {"message": "Successfully applied for the job."}

@router.get("/applied-jobs/{seeker_id}")
def get_applied_jobs(seeker_id: int, db: Session = Depends(get_db)):
    """
    Fetches all jobs that a specific job seeker has applied for.
    """
    applied_jobs = db.query(AppliedJob).filter(AppliedJob.seeker_id == seeker_id).all()

    if not applied_jobs:
        raise HTTPException(status_code=404, detail="No applied jobs found.")

    return [
        {
            "job_id": aj.job.job_id,
            "job_title": aj.job.job_title,
            "country": aj.job.country,
            "applied_at": aj.applied_at
        }
        for aj in applied_jobs
    ]
