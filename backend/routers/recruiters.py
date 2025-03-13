from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import RecruitmentAgency, User, Job, AppliedJob, JobSeeker
from schemas import RecruitmentAgencyCreate, RecruitmentAgencyResponse, JobResponse, AppliedJobResponse
from routers.auth import require_role
from routers.auth import get_current_user

router = APIRouter()

# IMPORTANT: More specific routes must be defined BEFORE parameter-based routes
# to avoid conflicts in route resolution

@router.get("/recruiters/my-posted-jobs", response_model=list[JobResponse])
def get_my_posted_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetches all jobs posted by the currently logged-in recruiter.
    """
    # Ensure user is a recruiter
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Permission denied")
        
    # Find the agency profile for the current user
    agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.user_id == current_user.user_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency profile not found.")
    
    # Get all jobs posted by this agency
    jobs = db.query(Job).filter(Job.agency_id == agency.agency_id).all()
    return jobs

@router.get("/recruiters/profile/me", response_model=RecruitmentAgencyResponse)
def get_my_agency_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetches the agency profile for the currently logged-in recruiter.
    """
    # Ensure user is a recruiter
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Permission denied")
        
    # Find the agency profile for the current user
    agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.user_id == current_user.user_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency profile not found.")
    
    return agency

@router.get("/recruiters/agency-id", response_model=dict)
def get_agency_id_for_user(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns the agency_id for the currently logged-in recruiter.
    """
    # Ensure user is a recruiter
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Permission denied")
        
    # Find the agency profile for the current user
    agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.user_id == current_user.user_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency profile not found.")
    
    return {"agency_id": agency.agency_id}

# Now define parameter-based routes AFTER the specific routes
@router.get("/recruiters/{agency_id}", response_model=RecruitmentAgencyResponse)
def get_agency_profile(agency_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetches the agency profile for the logged-in recruiter.
    """
    # Ensure user is a recruiter
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Permission denied")
        
    # Find the agency profile
    agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.agency_id == agency_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency profile not found.")
        
    # Ensure the user is accessing their own agency profile
    if agency.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You don't have permission to view this agency profile.")
    
    return agency

@router.get("/job-applicants/{job_id}/", response_model=list[dict])
def get_job_applicants(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetches all applicants for a job, but only if the recruiter owns the job.
    """
    # Ensure user is a recruiter
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Permission denied")
        
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    
    # Get the current user's agency
    agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.user_id == current_user.user_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Recruiter agency profile not found.")
    
    # Check if the logged-in recruiter owns this job
    if job.agency_id != agency.agency_id:
        raise HTTPException(status_code=403, detail="You do not have permission to view applicants for this job.")
    
    applied_jobs = db.query(AppliedJob).filter(AppliedJob.job_id == job_id).all()
    
    applicants = []
    for application in applied_jobs:
        seeker = db.query(JobSeeker).filter(JobSeeker.seeker_id == application.seeker_id).first()
        if seeker:
            # Get the User record for this job seeker to access their email
            user = db.query(User).filter(User.user_id == seeker.user_id).first()
            email = user.email if user else None
            
            applicants.append({
                "application_id": application.application_id,
                "job_id": application.job_id,
                "seeker_id": seeker.seeker_id,
                "name": seeker.name,
                "email": email,  # Include email from User table
                "skills": seeker.skills,
                "experience": seeker.previous_jobs,
                "education": seeker.education,
                "applied_at": application.applied_at,
                "cv_filename": application.cv_filename,
                "cover_letter_filename": application.cover_letter_filename
            })
    
    return applicants