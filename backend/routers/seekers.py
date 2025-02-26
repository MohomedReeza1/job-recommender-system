from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
from database import get_db
from models import JobSeeker, AppliedJob, User
from schemas import JobSeekerCreate, JobSeekerResponse, JobSeekerBase, JobSeekerUpdate, AppliedJobResponse
from routers.auth import require_role
from routers.auth import get_current_user
import os
from datetime import datetime
from typing import Optional

router = APIRouter()

UPLOAD_FOLDER = "uploads/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
@router.post("/apply-job/", response_model=AppliedJobResponse, dependencies=[Depends(require_role("job_seeker"))])
async def apply_job(
    user_id: int = Form(...),
    job_id: int = Form(...),
    cv: UploadFile = File(...),
    cover_letter: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows a job seeker to apply for a job with CV and optional cover letter.
    """
    try:
        # Check if already applied
        existing_application = db.query(AppliedJob).filter(
            AppliedJob.user_id == user_id,
            AppliedJob.job_id == job_id
        ).first()
        
        if existing_application:
            raise HTTPException(status_code=400, detail="You have already applied to this job")
        
        # Create upload directory if it doesn't exist
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Save CV file
        cv_filename = f"{datetime.now().timestamp()}_{cv.filename}"
        cv_path = os.path.join(UPLOAD_FOLDER, cv_filename)
        
        cv_content = await cv.read()
        with open(cv_path, "wb") as f:
            f.write(cv_content)
        
        # Save cover letter if provided
        cover_letter_filename = None
        if cover_letter:
            cover_letter_filename = f"{datetime.now().timestamp()}_{cover_letter.filename}"
            cover_letter_path = os.path.join(UPLOAD_FOLDER, cover_letter_filename)
            
            cover_letter_content = await cover_letter.read()
            with open(cover_letter_path, "wb") as f:
                f.write(cover_letter_content)
        
        # Create and save job application
        new_application = AppliedJob(
            user_id=user_id,
            job_id=job_id,
            cv_filename=cv_filename,
            cover_letter_filename=cover_letter_filename
        )
        
        db.add(new_application)
        db.commit()
        db.refresh(new_application)
        
        # Return a structure that matches AppliedJobResponse
        return {
            "application_id": new_application.application_id,
            "job_id": job_id,
            "user_id": user_id,
            "cv_filename": cv_filename,
            "cover_letter_filename": cover_letter_filename,
            "applied_at": new_application.applied_at
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Application failed: {str(e)}")


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
            "applied_at": aj.applied_at,
            "cv_filename": aj.cv_filename,
            "cover_letter_filename": aj.cover_letter_filename
        }
        for aj in applied_jobs
    ]

@router.get("/seekers/{user_id}", response_model=JobSeekerBase)
def get_job_seeker_profile(user_id: int, db: Session = Depends(get_db)):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == user_id).first()
    if not seeker:
        raise HTTPException(status_code=404, detail="Job Seeker not found")
    return seeker

@router.post("/seekers/", response_model=JobSeekerResponse, dependencies=[Depends(require_role("job_seeker"))])
def create_job_seeker(seeker: JobSeekerCreate, db: Session = Depends(get_db)):
    """
    Creates a new job seeker profile and links it to the authenticated user.
    """
    # Check if a seeker profile already exists for the user_id
    existing_seeker = db.query(JobSeeker).filter(JobSeeker.user_id == seeker.user_id).first()
    if existing_seeker:
        raise HTTPException(status_code=400, detail="Job seeker profile already exists.")

    new_seeker = JobSeeker(user_id=seeker.user_id, **seeker.dict(exclude={"user_id"}))  # Exclude user_id from dict
    db.add(new_seeker)
    db.commit()
    db.refresh(new_seeker)
    return new_seeker

@router.put("/seekers/{user_id}")
def update_job_seeker_profile(user_id: int, profile_data: JobSeekerUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    job_seeker = db.query(JobSeeker).filter(JobSeeker.user_id == user_id).first()
    if not job_seeker:
        raise HTTPException(status_code=404, detail="Profile not found")
    for key, value in profile_data.dict().items():
        setattr(job_seeker, key, value)
    db.commit()
    return job_seeker
