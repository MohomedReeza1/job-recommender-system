from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Job
from schemas import JobCreate, JobResponse
# from auth import require_role
from routers.auth import require_role

router = APIRouter()

@router.get("/jobs/", response_model=list[JobResponse])
def get_jobs(skip: int = 0, limit: int = 30, db: Session = Depends(get_db)):
    jobs = db.query(Job).offset(skip).limit(limit).all()
    return jobs

@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job_details(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/post-job/", response_model=JobResponse, dependencies=[Depends(require_role("recruiter"))])
def post_job(job: JobCreate, db: Session = Depends(get_db)):
    new_job = Job(**job.dict())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job
