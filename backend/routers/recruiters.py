from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import RecruitmentAgency, User, Job, AppliedJob, JobSeeker
from schemas import RecruitmentAgencyCreate, RecruitmentAgencyResponse, JobResponse, AppliedJobResponse
from routers.auth import require_role

router = APIRouter()

@router.post("/recruiters/", response_model=RecruitmentAgencyResponse, dependencies=[Depends(require_role("recruiter"))])
def create_agency(agency: RecruitmentAgencyCreate, db: Session = Depends(get_db)):
    """
    Allows recruiters to create their agency profile.
    """
    if not agency.agency_location:
        raise HTTPException(status_code=400, detail="Agency location is required.")
    
    existing_agency = db.query(RecruitmentAgency).filter(
        (RecruitmentAgency.license_number == agency.license_number) |
        (RecruitmentAgency.contact_email == agency.contact_email)
    ).first()
    
    if existing_agency:
        raise HTTPException(status_code=400, detail="License number or contact email already in use.")
    
    new_agency = RecruitmentAgency(**agency.dict())
    db.add(new_agency)
    db.commit()
    db.refresh(new_agency)
    
    return new_agency

@router.get("/recruiters/{user_id}", response_model=RecruitmentAgencyResponse, dependencies=[Depends(require_role("recruiter"))])
def get_agency_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Fetches the agency profile for the logged-in recruiter.
    """
    agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.user_id == user_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency profile not found.")
    return agency

@router.get("/recruiters/{user_id}/my-posted-jobs", response_model=list[JobResponse], dependencies=[Depends(require_role("recruiter"))])
def get_my_posted_jobs(user_id: int, db: Session = Depends(get_db)):
    """
    Fetches jobs posted by a specific recruiter.
    """
    agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.user_id == user_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Recruiter agency profile not found.")
    
    jobs = db.query(Job).filter(Job.recruiter_id == agency.agency_id).all()
    return jobs

@router.get("/job-applicants/{job_id}/", response_model=list[AppliedJobResponse], dependencies=[Depends(require_role("recruiter"))])
def get_job_applicants(job_id: int, db: Session = Depends(get_db)):
    """
    Fetches all applicants for a job, but only if the recruiter owns the job.
    """
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    
    # Check if the logged-in recruiter owns this job
    recruiter = db.query(RecruitmentAgency).filter(RecruitmentAgency.agency_id == job.recruiter_id).first()
    if not recruiter:
        raise HTTPException(status_code=403, detail="You do not have permission to view applicants for this job.")
    
    applied_jobs = db.query(AppliedJob).filter(AppliedJob.job_id == job_id).all()
    
    applicants = []
    for application in applied_jobs:
        seeker = db.query(JobSeeker).filter(JobSeeker.seeker_id == application.seeker_id).first()
        applicants.append({
            "application_id": application.application_id,
            "job_id": application.job_id,
            "seeker_id": seeker.seeker_id,
            "name": seeker.name,
            "skills": seeker.skills,
            "experience": seeker.previous_jobs,
            "applied_at": application.applied_at
        })
    
    return applicants
