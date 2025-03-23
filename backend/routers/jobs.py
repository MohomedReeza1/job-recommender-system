from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Job, User, RecruitmentAgency
from schemas import JobCreate, JobResponse, JobBase
from routers.auth import require_role
from routers.auth import get_current_user

router = APIRouter()

@router.get("/jobs/", response_model=list[JobResponse])
def get_jobs(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    jobs = db.query(Job).offset(skip).limit(limit).all()
    return jobs

@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job_details(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/post-job/", response_model=JobResponse, dependencies=[Depends(require_role("recruiter"))])
def post_job(job: JobCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Post a new job listing."""
    # Get the agency_id for the current user
    agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.user_id == current_user.user_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Recruiter agency profile not found")
    
    # IMPORTANT: Use agency_id as this matches the column name in the database model
    job_data = job.dict()
    job_data["agency_id"] = agency.agency_id
    
    new_job = Job(**job_data)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.delete("/jobs/{job_id}", dependencies=[Depends(require_role("recruiter"))])
def delete_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Deletes a job posting if the authenticated recruiter is the owner.
    """
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get the agency_id for the current user
    agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.user_id == current_user.user_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Recruiter agency profile not found")
    
    # Check if the current recruiter owns this job
    if job.agency_id != agency.agency_id:
        raise HTTPException(status_code=403, detail="You don't have permission to delete this job")
    
    # Delete the job
    db.delete(job)
    db.commit()
    
    return {"message": "Job deleted successfully"}

@router.put("/jobs/{job_id}", response_model=JobResponse, dependencies=[Depends(require_role("recruiter"))])
def update_job(job_id: int, job_data: JobBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Updates an existing job posting if the authenticated recruiter is the owner.
    """
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get the agency_id for the current user
    agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.user_id == current_user.user_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Recruiter agency profile not found")
    
    # Check if the current recruiter owns this job
    if job.agency_id != agency.agency_id:
        raise HTTPException(status_code=403, detail="You don't have permission to update this job")
    
    # Update job fields
    for key, value in job_data.dict().items():
        setattr(job, key, value)
    
    # Save changes
    db.commit()
    db.refresh(job)
    
    return job