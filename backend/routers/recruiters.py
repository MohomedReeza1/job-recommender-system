from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import RecruitmentAgency, User
from schemas import RecruitmentAgencyCreate, RecruitmentAgencyResponse
from routers.auth import require_role

router = APIRouter()

@router.post("/recruiters/", response_model=RecruitmentAgencyResponse, dependencies=[Depends(require_role("recruiter"))])
def create_agency(agency: RecruitmentAgencyCreate, db: Session = Depends(get_db)):
    """
    Allows recruiters to create their agency profile.
    """
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
