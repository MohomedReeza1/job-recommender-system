from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base

class Job(Base):
    __tablename__ = "job_list"
    job_id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String(50), nullable=False)
    country = Column(String(50), nullable=False)
    job_description = Column(Text, nullable=False)
    skills_required = Column(Text, nullable=False)
    experience_required = Column(String(30), nullable=False)
    age_required = Column(String(10))
    salary = Column(String(20))
    working_hours = Column(String(20))
    facilities = Column(Text)
    looking_gender = Column(String(20))
    num_of_job_seekers_required = Column(Integer)
    available_quantity = Column(Integer)

class JobSeeker(Base):
    __tablename__ = "job_seekers"
    seeker_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
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

class AppliedJob(Base):
    __tablename__ = "applied_jobs"
    id = Column(Integer, primary_key=True, index=True)
    seeker_id = Column(Integer, ForeignKey("job_seekers.seeker_id"))
    job_id = Column(Integer, ForeignKey("job_list.job_id"))

    job = relationship("Job")
    seeker = relationship("JobSeeker")


# class UserJobInteraction(Base):
#     __tablename__ = "user_job_interactions"
#     interaction_id = Column(Integer, primary_key=True, index=True)
#     seeker_id = Column(Integer, ForeignKey("job_seekers.seeker_id"))
#     job_id = Column(Integer, ForeignKey("job_list.job_id"))
#     interaction_type = Column(String(20))
#     interaction_value = Column(Float)
