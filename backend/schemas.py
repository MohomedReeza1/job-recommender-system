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


class UserResponse(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True




# 2️⃣ Job Seeker Schema
class JobSeekerBase(BaseModel):
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
    user_id: int  # Required when creating a job seeker

class JobSeekerResponse(JobSeekerBase):
    seeker_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# 3️⃣ Recruitment Agency Schema
class RecruitmentAgencyBase(BaseModel):
    agency_name: str
    agency_location: str
    license_number: str
    contact_email: Optional[EmailStr]


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
    recruiter_id: int  # Required when creating a job

class JobResponse(JobBase):
    job_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# 5️⃣ Applied Jobs Schema
class AppliedJobBase(BaseModel):
    job_id: int
    seeker_id: int

class AppliedJobResponse(AppliedJobBase):
    application_id: int
    applied_at: datetime

    class Config:
        from_attributes = True


# Recommendation schema (Used for Job Matching API)
class RecommendationRequest(BaseModel):
    name: str
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


# Authentication Schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int


############

class JobSeekerUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    marital_status: Optional[str] = None
    num_of_children: Optional[int] = None
    education: Optional[str] = None
    skills: Optional[str] = None
    interests: Optional[str] = None
    previous_jobs: Optional[str] = None
    looking_jobs: Optional[str] = None
    description: Optional[str] = None
    passport_status: Optional[str] = None

    class Config:
        from_attributes = True
