from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import JobSeeker
from utils.ml_models import get_top_recommendations
from utils.ml_models import get_top_recommendations_from_data
from schemas import JobResponse

router = APIRouter()

@router.get("/recommendations/{seeker_id}", response_model=list[JobResponse])
def recommend_jobs(seeker_id: int, db: Session = Depends(get_db)):
    recommended_jobs = get_top_recommendations(seeker_id, db, top_n=3)
    if not recommended_jobs:
        raise HTTPException(status_code=404, detail="No recommendations found for this job seeker.")
    return recommended_jobs

@router.post("/recommendations/", response_model=list[JobResponse])
def recommend_jobs(seeker_data: dict, db: Session = Depends(get_db)):
    recommendations = get_top_recommendations_from_data(seeker_data, db, top_n=3)
    if not recommendations:
        raise HTTPException(status_code=404, detail="No recommendations found.")
    return recommendations
