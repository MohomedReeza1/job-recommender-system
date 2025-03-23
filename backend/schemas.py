from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# 1️⃣ User Schema (Common for Job Seekers & Recruiters)
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str


class UserCreate(UserBase):
    password: str
    agency_location: Optional[str] = None
    license_number: Optional[str] = None


class UserResponse(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# 2️⃣ Job Seeker Schema
class JobSeekerBase(BaseModel):
    """Base model with all job seeker fields"""
    name: Optional[str]
    age: Optional[int]
    gender: Optional[str]
    height: Optional[float]
    weight: Optional[float]
    marital_status: Optional[str]
    num_of_children: Optional[int]
    education: Optional[str]
    skills: Optional[str]
    interests: Optional[str]
    previous_jobs: Optional[str]
    looking_jobs: Optional[str]
    description: Optional[str]
    passport_status: Optional[str]

class JobSeekerCreate(JobSeekerBase):
    """Used when creating a job seeker profile"""
    user_id: int  # Required when creating a job seeker

class JobSeekerResponse(JobSeekerBase):
    """Response model including system-generated fields"""
    seeker_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class JobSeekerUpdate(JobSeekerBase):
    """For updates - inherits all fields from JobSeekerBase, all optional"""
    # No need to add anything as JobSeekerBase already has all fields as Optional
    # If specific validation is needed for updates, it can be added here
    
    class Config:
        from_attributes = True

class RecommendationRequest(JobSeekerBase):
    """For generating recommendations - inherits all fields from JobSeekerBase"""
    # If recommendation requires any special fields not in JobSeekerBase, add them here
    
    # If certain fields must be required for recommendations, override them here:
    # skills: str  # Making skills required for recommendations


# 3️⃣ Recruitment Agency Schema
class RecruitmentAgencyBase(BaseModel):
    agency_name: str
    agency_location: str
    license_number: str
    contact_email: EmailStr


class RecruitmentAgencyCreate(RecruitmentAgencyBase):
    user_id: int  # Required when creating an agency


class RecruitmentAgencyResponse(RecruitmentAgencyBase):
    agency_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# 4️⃣ Job Schema
class JobBase(BaseModel):
    job_title: str
    country: str
    job_description: str
    skills_required: str
    experience_required: Optional[str]
    age_required: Optional[str]
    salary: Optional[str]
    working_hours: Optional[str]
    facilities: Optional[str]
    looking_gender: Optional[str]
    num_of_job_seekers_required: Optional[int]
    available_quantity: Optional[int]

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    job_id: int
    agency_id: int  # Changed from recruiter_id to agency_id to match the model
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# 5️⃣ Applied Jobs Schema
class AppliedJobBase(BaseModel):
    job_id: int
    seeker_id: int
    cv_filename: Optional[str] = None
    cover_letter_filename: Optional[str] = None

class AppliedJobResponse(AppliedJobBase):
    application_id: int
    applied_at: datetime

    class Config:
        from_attributes = True


# Authentication Schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    specific_id: Optional[int]


