from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import JobSeeker
from utils.ml_models import get_top_recommendations, get_top_recommendations_from_data
from schemas import JobResponse, RecommendationRequest

router = APIRouter()

@router.get("/recommendations/{seeker_id}", response_model=list[JobResponse])
def recommend_jobs(seeker_id: int, db: Session = Depends(get_db)):
    """
    Fetches job recommendations for an existing job seeker.
    """
    recommended_jobs = get_top_recommendations(seeker_id, db, top_n=3)
    if not recommended_jobs:
        raise HTTPException(status_code=404, detail="No recommendations found for this job seeker.")
    return recommended_jobs

@router.post("/recommendations/", response_model=list[JobResponse])
def recommend_jobs(seeker_data: RecommendationRequest, db: Session = Depends(get_db)):
    """
    Fetches job recommendations for a new job seeker based on their input profile.
    """
    try:
        recommendations = get_top_recommendations_from_data(seeker_data.dict(), db, top_n=3)
        if not recommendations:
            return []
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")
