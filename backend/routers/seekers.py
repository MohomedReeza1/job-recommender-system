from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
from database import get_db
from models import JobSeeker, AppliedJob, User, Job
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
        # Get the seeker_id for the current user
        seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.user_id).first()
        if not seeker:
            raise HTTPException(status_code=404, detail="Job seeker profile not found")
        
        seeker_id = seeker.seeker_id
        
        # Check if already applied
        existing_application = db.query(AppliedJob).filter(
            AppliedJob.seeker_id == seeker_id,
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
            seeker_id=seeker_id,
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
            "seeker_id": seeker_id,
            "cv_filename": cv_filename,
            "cover_letter_filename": cover_letter_filename,
            "applied_at": new_application.applied_at
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Application failed: {str(e)}")

@router.get("/applied-jobs/{seeker_id}")
def get_applied_jobs(seeker_id: str, db: Session = Depends(get_db)):
    """
    Fetches all jobs that a specific seeker has applied for.
    """
    try:
        # Convert seeker_id to integer
        try:
            seeker_id_int = int(seeker_id)
        except ValueError:
            return []  # Return empty list for invalid ID
            
        # Get all applications by this seeker
        applied_jobs = db.query(AppliedJob).filter(AppliedJob.seeker_id == seeker_id_int).all()
        
        if not applied_jobs:
            return []  # Return empty list instead of 404 error

        result = []
        for aj in applied_jobs:
            # Join with Jobs table to get job details
            job = db.query(Job).filter(Job.job_id == aj.job_id).first()
            if job:
                result.append({
                    "job_id": job.job_id,
                    "job_title": job.job_title,
                    "country": job.country,
                    "applied_at": aj.applied_at,
                    "cv_filename": aj.cv_filename,
                    "cover_letter_filename": aj.cover_letter_filename
                })
        
        return result
    except Exception as e:
        # Log the error
        print(f"Error fetching applied jobs: {str(e)}")
        # Return empty list to prevent frontend errors
        return []

@router.get("/seekers/{seeker_id}", response_model=JobSeekerBase)
def get_job_seeker_profile(seeker_id: str, db: Session = Depends(get_db)):
    """
    Fetches a job seeker's profile by ID.
    Now handles string IDs and converts them to integers.
    """
    try:
        # Convert seeker_id to integer
        try:
            seeker_id_int = int(seeker_id)
        except ValueError:
            # Return a default empty profile instead of raising an error
            return JobSeekerBase(
                name="",
                age=None,
                gender="",
                height=None,
                weight=None,
                marital_status="",
                num_of_children=None,
                education="",
                skills="",
                interests="",
                previous_jobs="",
                looking_jobs="",
                description="",
                passport_status=""
            )
            
        seeker = db.query(JobSeeker).filter(JobSeeker.seeker_id == seeker_id_int).first()
        if not seeker:
            # Return a default empty profile instead of 404
            return JobSeekerBase(
                name="",
                age=None,
                gender="",
                height=None,
                weight=None,
                marital_status="",
                num_of_children=None,
                education="",
                skills="",
                interests="",
                previous_jobs="",
                looking_jobs="",
                description="",
                passport_status=""
            )
        return seeker
    except Exception as e:
        print(f"Error in get_job_seeker_profile: {str(e)}")
        # Return a default empty profile
        return JobSeekerBase(
            name="",
            age=None,
            gender="",
            height=None,
            weight=None,
            marital_status="",
            num_of_children=None,
            education="",
            skills="",
            interests="",
            previous_jobs="",
            looking_jobs="",
            description="",
            passport_status=""
        )

@router.post("/seekers/", response_model=JobSeekerResponse, dependencies=[Depends(require_role("job_seeker"))])
def create_job_seeker(seeker: JobSeekerCreate, db: Session = Depends(get_db)):
    """
    Updates an existing job seeker profile or creates a new one if it doesn't exist.
    """
    # Check if a seeker profile already exists for the user_id
    existing_seeker = db.query(JobSeeker).filter(JobSeeker.user_id == seeker.user_id).first()
    
    if existing_seeker:
        # Update existing profile
        for key, value in seeker.dict(exclude={"user_id"}).items():
            setattr(existing_seeker, key, value)
        db.commit()
        db.refresh(existing_seeker)
        return existing_seeker
    else:
        # Create new profile (fallback - should already exist from registration)
        new_seeker = JobSeeker(user_id=seeker.user_id, **seeker.dict(exclude={"user_id"}))
        db.add(new_seeker)
        db.commit()
        db.refresh(new_seeker)
        return new_seeker

@router.put("/seekers/{seeker_id}")
def update_job_seeker_profile(seeker_id: str, profile_data: JobSeekerUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        # Convert seeker_id to integer
        try:
            seeker_id_int = int(seeker_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid seeker ID format")
            
        job_seeker = db.query(JobSeeker).filter(JobSeeker.seeker_id == seeker_id_int).first()
        if not job_seeker:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Verify user is updating their own profile
        if job_seeker.user_id != current_user.user_id:
            raise HTTPException(status_code=403, detail="You don't have permission to update this profile")
        
        for key, value in profile_data.dict().items():
            setattr(job_seeker, key, value)
        db.commit()
        return job_seeker
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid seeker ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")