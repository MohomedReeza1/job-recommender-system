# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from database import get_db
# from models import RecruitmentAgency, User, Job, AppliedJob, JobSeeker
# from schemas import RecruitmentAgencyCreate, RecruitmentAgencyResponse, JobResponse
# from routers.auth import require_role
# from routers.auth import get_current_user

# router = APIRouter()

# @router.get("/recruiters/{agency_id}", response_model=RecruitmentAgencyResponse, dependencies=[Depends(require_role("recruiter"))])
# async def get_agency_profile(agency_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
#     """
#     Fetches the agency profile for the logged-in recruiter.
#     """
#     # Ensure the agency_id is valid
#     if not agency_id:
#         raise HTTPException(status_code=404, detail="Invalid agency ID")
    
#     try:
#         # Fetch the agency profile
#         agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.agency_id == agency_id).first()
        
#         # Verify the profile belongs to the current user
#         if not agency or agency.user_id != current_user.user_id:
#             raise HTTPException(status_code=403, detail="You don't have permission to access this profile")
            
#         return agency
#     except ValueError:
#         raise HTTPException(status_code=422, detail="Invalid agency ID format")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error retrieving profile: {str(e)}")

# @router.get("/recruiters/{agency_id}/my-posted-jobs", response_model=list[JobResponse], dependencies=[Depends(require_role("recruiter"))])
# async def get_my_posted_jobs(agency_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
#     """
#     Fetches jobs posted by a specific recruiter.
#     """
#     # Ensure the agency_id is valid
#     if not agency_id:
#         raise HTTPException(status_code=404, detail="Invalid agency ID")
    
#     try:
#         # Verify the agency belongs to the current user
#         agency = db.query(RecruitmentAgency).filter(
#             RecruitmentAgency.agency_id == agency_id,
#             RecruitmentAgency.user_id == current_user.user_id
#         ).first()
        
#         if not agency:  
#             raise HTTPException(status_code=403, detail="You don't have permission to view these jobs")
        
#         # Fetch the jobs
#         jobs = db.query(Job).filter(Job.recruiter_id == agency_id).all()
#         return jobs
#     except ValueError:
#         raise HTTPException(status_code=422, detail="Invalid agency ID format")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error retrieving jobs: {str(e)}")


# @router.get("/job-applicants/{job_id}/", dependencies=[Depends(require_role("recruiter"))])
# async def get_job_applicants(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
#     """
#     Fetches all applicants for a job, but only if the recruiter owns the job.
#     """
#     if not job_id:
#         raise HTTPException(status_code=400, detail="Invalid job ID")
    
#     try:
#         job = db.query(Job).filter(Job.job_id == job_id).first()
#         if not job:
#             raise HTTPException(status_code=404, detail="Job not found.")
        
#         # Get the current user's agency
#         agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.user_id == current_user.user_id).first()
#         if not agency:
#             raise HTTPException(status_code=404, detail="Recruiter profile not found.")
        
#         # Check if the logged-in recruiter owns this job
#         if job.recruiter_id != agency.agency_id:
#             raise HTTPException(status_code=403, detail="You do not have permission to view applicants for this job.")
        
#         applied_jobs = db.query(AppliedJob).filter(AppliedJob.job_id == job_id).all()
        
#         applicants = []
#         for application in applied_jobs:
#             seeker = db.query(JobSeeker).filter(JobSeeker.seeker_id == application.seeker_id).first()
#             if seeker:
#                 applicants.append({
#                     "application_id": application.application_id,
#                     "job_id": application.job_id,
#                     "seeker_id": seeker.seeker_id,
#                     "name": seeker.name,
#                     "skills": seeker.skills,
#                     "experience": seeker.previous_jobs,
#                     "education": seeker.education,
#                     "cv_filename": application.cv_filename,
#                     "cover_letter_filename": application.cover_letter_filename,
#                     "applied_at": application.applied_at
#                 })
        
#         return applicants
#     except ValueError:
#         raise HTTPException(status_code=422, detail="Invalid job ID format")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to fetch applicants: {str(e)}")

# @router.put("/recruiters/{agency_id}", response_model=RecruitmentAgencyResponse, dependencies=[Depends(require_role("recruiter"))])
# async def update_recruiter_profile(agency_id: int, profile_data: RecruitmentAgencyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
#     """
#     Updates an existing recruiter's profile.
#     """
#     try:
#         recruiter = db.query(RecruitmentAgency).filter(RecruitmentAgency.agency_id == agency_id).first()
#         if not recruiter:
#             # Create a new profile if it doesn't exist
#             new_recruiter = RecruitmentAgency(**profile_data.dict())
#             db.add(new_recruiter)
#             db.commit()
#             db.refresh(new_recruiter)
#             return new_recruiter

#         # Verify user is updating their own profile
#         if recruiter.user_id != current_user.user_id:
#             raise HTTPException(status_code=403, detail="You don't have permission to update this profile")

#         # Update the profile
#         for key, value in profile_data.dict(exclude_unset=True).items():
#             setattr(recruiter, key, value)

#         db.commit()
#         db.refresh(recruiter)
#         return recruiter
#     except ValueError:
#         raise HTTPException(status_code=422, detail="Invalid agency ID format")
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")


# @router.post("/recruiters/", response_model=RecruitmentAgencyResponse)
# async def create_recruiter_profile(recruiter: RecruitmentAgencyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
#     """
#     Creates a new recruiter profile or updates an existing one.
#     """
#     try:
#         # Debug log
#         print(f"Creating/updating recruiter profile with data: {recruiter}")
        
#         # Ensure the user is a recruiter
#         if current_user.role != "recruiter":
#             raise HTTPException(status_code=403, detail="Only recruiters can create recruiter profiles")
        
#         # Ensure user_id matches current user
#         if recruiter.user_id != current_user.user_id:
#             print(f"Adjusting user_id from {recruiter.user_id} to {current_user.user_id}")
#             recruiter.user_id = current_user.user_id
        
#         # Check if a profile already exists
#         existing_recruiter = db.query(RecruitmentAgency).filter(RecruitmentAgency.user_id == current_user.user_id).first()
        
#         if existing_recruiter:
#             print(f"Updating existing profile for user {current_user.user_id}")
#             # Update existing profile with new data
#             for key, value in recruiter.dict(exclude={"user_id"}).items():
#                 setattr(existing_recruiter, key, value)
#             db.commit()
#             db.refresh(existing_recruiter)
#             return existing_recruiter
#         else:
#             print(f"Creating new profile for user {current_user.user_id}")
#             # Create new profile with provided data
#             new_recruiter = RecruitmentAgency(**recruiter.dict())
#             db.add(new_recruiter)
#             db.commit()
#             db.refresh(new_recruiter)
#             return new_recruiter
#     except Exception as e:
#         db.rollback()
#         print(f"Error creating/updating recruiter profile: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Failed to create/update profile: {str(e)}")


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import RecruitmentAgency, User, Job, AppliedJob, JobSeeker
from schemas import RecruitmentAgencyCreate, RecruitmentAgencyResponse, JobResponse, AppliedJobResponse
from routers.auth import require_role
from routers.auth import get_current_user

router = APIRouter()

@router.get("/recruiters/{agency_id}", response_model=RecruitmentAgencyResponse, dependencies=[Depends(require_role("recruiter"))])
def get_agency_profile(agency_id: int, db: Session = Depends(get_db)):
    """
    Fetches the agency profile for the logged-in recruiter.
    """
    agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.agency_id == agency_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency profile not found.")
    return agency

@router.get("/recruiters/{agency_id}/my-posted-jobs", response_model=list[JobResponse], dependencies=[Depends(require_role("recruiter"))])
def get_my_posted_jobs(agency_id: int, db: Session = Depends(get_db)):
    """
    Fetches jobs posted by a specific recruiter.
    """
    agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.agency_id == agency_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Recruiter agency profile not found.")
    
    # CRITICAL FIX: Use agency_id instead of recruiter_id
    jobs = db.query(Job).filter(Job.agency_id == agency_id).all()
    return jobs

@router.get("/job-applicants/{job_id}/", response_model=list[AppliedJobResponse], dependencies=[Depends(require_role("recruiter"))])
def get_job_applicants(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetches all applicants for a job, but only if the recruiter owns the job.
    """
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    
    # Get the current user's agency
    agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.user_id == current_user.user_id).first()
    
    # Check if the logged-in recruiter owns this job
    # CRITICAL FIX: Use agency_id instead of recruiter_id
    if job.agency_id != agency.agency_id:
        raise HTTPException(status_code=403, detail="You do not have permission to view applicants for this job.")
    
    applied_jobs = db.query(AppliedJob).filter(AppliedJob.job_id == job_id).all()
    
    applicants = []
    for application in applied_jobs:
        seeker = db.query(JobSeeker).filter(JobSeeker.seeker_id == application.seeker_id).first()
        if seeker:
            applicants.append({
                "application_id": application.application_id,
                "job_id": application.job_id,
                "seeker_id": seeker.seeker_id,
                "name": seeker.name,
                "skills": seeker.skills,
                "experience": seeker.previous_jobs,
                "applied_at": application.applied_at,
                "cv_filename": application.cv_filename,
                "cover_letter_filename": application.cover_letter_filename
            })
    
    return applicants

@router.put("/recruiters/{agency_id}", response_model=RecruitmentAgencyResponse, dependencies=[Depends(require_role("recruiter"))])
def update_recruiter_profile(agency_id: int, profile_data: RecruitmentAgencyCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """
    Updates an existing recruiter's profile.
    """
    recruiter = db.query(RecruitmentAgency).filter(RecruitmentAgency.agency_id == agency_id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Verify user is updating their own profile
    if recruiter.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You don't have permission to update this profile")

    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(recruiter, key, value)

    db.commit()
    db.refresh(recruiter)
    return recruiter

@router.post("/recruiters/", response_model=RecruitmentAgencyResponse, dependencies=[Depends(require_role("recruiter"))])
def create_recruiter_profile(recruiter: RecruitmentAgencyCreate, db: Session = Depends(get_db)):
    """
    Updates an existing recruiter profile or creates a new one if it doesn't exist.
    """
    # Check if a recruiter profile already exists for the user_id
    existing_recruiter = db.query(RecruitmentAgency).filter(RecruitmentAgency.user_id == recruiter.user_id).first()
    
    if existing_recruiter:
        # Update existing profile
        for key, value in recruiter.dict(exclude={"user_id"}).items():
            setattr(existing_recruiter, key, value)
        db.commit()
        db.refresh(existing_recruiter)
        return existing_recruiter
    else:
        # Create new profile (fallback - should already exist from registration)
        new_recruiter = RecruitmentAgency(**recruiter.dict())
        db.add(new_recruiter)
        db.commit()
        db.refresh(new_recruiter)
        return new_recruiter