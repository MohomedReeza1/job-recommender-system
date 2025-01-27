from pydantic import BaseModel
from typing import Optional

# Job schema
class JobCreate(BaseModel):
    job_title: str
    country: str
    job_description: str
    skills_required: str
    experience_required: str
    age_required: Optional[str]
    salary: Optional[str]
    working_hours: Optional[str]
    facilities: Optional[str]
    looking_gender: Optional[str]
    num_of_job_seekers_required: Optional[int]
    available_quantity: Optional[int]

class JobResponse(BaseModel):
    job_id: int
    job_title: str
    country: str
    job_description: str
    skills_required: str
    experience_required: str
    age_required: Optional[str]
    salary: Optional[str]
    working_hours: Optional[str]
    facilities: Optional[str]
    looking_gender: Optional[str]
    num_of_job_seekers_required: Optional[int]
    available_quantity: Optional[int]

    class Config:
        orm_mode = True

# Job seeker schema
class JobSeekerCreate(BaseModel):
    name: str
    age: int
    gender: str
    height: float
    weight: float
    marital_status: str
    num_of_children: int
    education: str
    skills: str
    interests: str
    previous_jobs: str
    looking_jobs: str
    description: str
    passport_status: str

class JobSeekerResponse(BaseModel):
    name: str
    age: int
    gender: str
    height: float
    weight: float
    marital_status: str
    num_of_children: int
    education: str
    skills: str
    interests: str
    previous_jobs: str
    looking_jobs: str
    description: str
    passport_status: str

    class Config:
        orm_mode = True
