from sqlalchemy import TIMESTAMP, Column, Integer, String, Text, ForeignKey, Float, Boolean, func
from sqlalchemy.orm import relationship
from database import Base


# 1️⃣ Users Table (Common for Job Seekers & Recruiters)
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)  # Store hashed password
    role = Column(String(20), nullable=False)  # "job_seeker" or "recruiter"
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # One-to-One Relationship
    job_seeker_profile = relationship("JobSeeker", back_populates="user", uselist=False)
    recruiter_profile = relationship("RecruitmentAgency", back_populates="user", uselist=False)

# 2️⃣ Job Seekers Table (Linked to `users`)
class JobSeeker(Base):
    __tablename__ = "job_seekers"

    seeker_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(Text)
    age = Column(Integer)
    gender = Column(String(10))
    height = Column(Float)
    weight = Column(Float)
    marital_status = Column(String(20))
    num_of_children = Column(Integer)
    education = Column(Text)
    skills = Column(Text)
    interests = Column(Text) 
    previous_jobs = Column(Text)
    looking_jobs = Column(Text)
    description = Column(Text)
    passport_status = Column(String(20))
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="job_seeker_profile")
    applications = relationship("AppliedJob", back_populates="seeker")


# 3️⃣ Recruitment Agencies Table (Linked to `users`)
class RecruitmentAgency(Base):
    __tablename__ = "recruitment_agencies"

    agency_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    agency_name = Column(String(100), nullable=False)
    agency_location = Column(String(100), nullable=False)
    license_number = Column(String(50), unique=True, nullable=False)
    contact_email = Column(String(100), unique=True) 
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="recruiter_profile")
    jobs = relationship("Job", back_populates="agency")


# 4️⃣ Jobs Table (Linked to `recruitment_agencies`)
class Job(Base):
    __tablename__ = "jobs"

    job_id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String(100), nullable=False)
    country = Column(String(50), nullable=False)
    job_description = Column(Text, nullable=False)
    skills_required = Column(Text, nullable=False)
    experience_required = Column(String(50))
    age_required = Column(String(10))
    salary = Column(String(20))
    working_hours = Column(String(20))
    facilities = Column(Text)
    looking_gender = Column(String(20))
    num_of_job_seekers_required = Column(Integer)
    available_quantity = Column(Integer)
    agency_id = Column(Integer, ForeignKey("recruitment_agencies.agency_id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    agency = relationship("RecruitmentAgency", back_populates="jobs")
    applications = relationship("AppliedJob", back_populates="job")

# 5️⃣ Applied Jobs Table (Job Applications)
class AppliedJob(Base):
    __tablename__ = "applied_jobs"

    application_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    seeker_id = Column(Integer, ForeignKey("job_seekers.seeker_id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.job_id", ondelete="CASCADE"), nullable=False)
    cv_filename = Column(String(255), nullable=True)
    cover_letter_filename = Column(String(255), nullable=True)
    applied_at = Column(TIMESTAMP, server_default=func.now())

    job = relationship("Job", back_populates="applications")
    seeker = relationship("JobSeeker", back_populates="applications")


# class UserJobInteraction(Base):
#     __tablename__ = "user_job_interactions"
#     interaction_id = Column(Integer, primary_key=True, index=True)
#     seeker_id = Column(Integer, ForeignKey("job_seekers.seeker_id"))
#     job_id = Column(Integer, ForeignKey("job_list.job_id"))
#     interaction_type = Column(String(20))
#     interaction_value = Column(Float)
