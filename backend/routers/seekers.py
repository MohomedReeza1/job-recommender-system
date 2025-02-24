from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import JobSeeker, AppliedJob
from schemas import JobSeekerCreate, JobSeekerResponse, JobSeekerBase, JobSeekerUpdate
from routers.auth import require_role
from routers.auth import get_current_user

router = APIRouter()

@router.post("/seekers/", response_model=JobSeekerResponse, dependencies=[Depends(require_role("job_seeker"))])
def create_job_seeker(seeker: JobSeekerCreate, db: Session = Depends(get_db)):
    new_seeker = JobSeeker(**seeker.dict())
    db.add(new_seeker)
    db.commit()
    db.refresh(new_seeker)
    return new_seekers

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

#################

@router.get("/seekers/{user_id}", response_model=JobSeekerBase)
def get_job_seeker_profile(user_id: int, db: Session = Depends(get_db)):
    seeker = db.query(JobSeeker).filter(JobSeeker.id == user_id).first()
    if not seeker:
        raise HTTPException(status_code=404, detail="Job Seeker not found")
    return seeker

@router.post("/seekers/{user_id}")
def create_job_seeker_profile(user_id: int, profile_data: JobSeekerCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    existing_profile = db.query(JobSeeker).filter(JobSeeker.user_id == user_id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")
    new_profile = JobSeeker(user_id=user_id, **profile_data.dict())
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

@router.put("/seekers/{user_id}")
def update_job_seeker_profile(user_id: int, profile_data: JobSeekerUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    job_seeker = db.query(JobSeeker).filter(JobSeeker.user_id == user_id).first()
    if not job_seeker:
        raise HTTPException(status_code=404, detail="Profile not found")
    for key, value in profile_data.dict().items():
        setattr(job_seeker, key, value)
    db.commit()
    return job_seeker
