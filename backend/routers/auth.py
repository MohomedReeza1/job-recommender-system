from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, JobSeeker, RecruitmentAgency
from schemas import UserCreate, UserLogin, Token
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Secret key & encryption settings
SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Hashing utility
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Extracts the current user from the JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        email: str = payload.get("sub")
        role: str = payload.get("role")  
        specific_id: int = payload.get("specific_id")  # Add this line

        if user_id is None or email is None or role is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.user_id == user_id, User.email == email).first()

    if user is None:
        raise credentials_exception

    # Add specific_id to the user object for easier access
    if not hasattr(user, 'specific_id'):
        setattr(user, 'specific_id', specific_id)

    return user

def require_role(role: str):
    def role_dependency(user: User = Depends(get_current_user)):
        if user.role != role:
            raise HTTPException(status_code=403, detail="Permission denied")
        return user
    return role_dependency

@router.post("/register", response_model=Token)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        # Create user
        hashed_password = get_password_hash(user.password)
        new_user = User(name=user.name, email=user.email, password_hash=hashed_password, role=user.role)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create empty profile based on user role
        specific_id = None
        
        if new_user.role == "job_seeker":
            try:
                # Create empty job seeker profile
                new_profile = JobSeeker(
                    user_id=new_user.user_id,
                    name=new_user.name  # Set the name field from the user registration
                )
                db.add(new_profile)
                db.commit()
                db.refresh(new_profile)
                specific_id = new_profile.seeker_id
                print(f"Created job seeker profile with id {specific_id} for user {new_user.email}")
            except Exception as e:
                print(f"Error creating job seeker profile: {str(e)}")
                # Don't fail registration if profile creation fails
                specific_id = None
        
        elif new_user.role == "recruiter":
            try:
                # Create empty recruitment agency profile
                new_profile = RecruitmentAgency(
                    user_id=new_user.user_id,
                    agency_name=new_user.name or "Agency",  # Use name from registration or default
                    agency_location="Not specified",  # Placeholder
                    license_number=f"TMP-{new_user.user_id}"  # Temporary unique license number
                )
                db.add(new_profile)
                db.commit()
                db.refresh(new_profile)
                specific_id = new_profile.agency_id
                print(f"Created agency profile with id {specific_id} for user {new_user.email}")
            except Exception as e:
                print(f"Error creating agency profile: {str(e)}")
                # Don't fail registration if profile creation fails
                specific_id = None
        
        access_token = create_access_token({
            "sub": new_user.email, 
            "role": new_user.role, 
            "user_id": new_user.user_id,
            "specific_id": specific_id
        })
        
        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "role": new_user.role, 
            "user_id": new_user.user_id,
            "specific_id": specific_id
        }
    except Exception as e:
        # Rollback in case of any error
        db.rollback()
        print(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user or not verify_password(form_data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        requested_role = form_data.scopes[0] if form_data.scopes else None
        if requested_role and user.role != requested_role:
            raise HTTPException(status_code=403, detail=f"Unauthorized! This account is a {user.role}")
        
        # Get the role-specific ID
        specific_id = None
        if user.role == "job_seeker":
            # First check if a profile already exists
            seeker = db.query(JobSeeker).filter(JobSeeker.user_id == user.user_id).first()
            if seeker:
                specific_id = seeker.seeker_id
                print(f"Found existing job seeker profile with ID: {specific_id}")
            
            # If no seeker profile exists, create one
            if not seeker:
                try:
                    # Create empty job seeker profile
                    new_profile = JobSeeker(
                        user_id=user.user_id,
                        name=user.name or "Job Seeker"  # Set name from user data
                    )
                    db.add(new_profile)
                    db.commit()
                    db.refresh(new_profile)
                    specific_id = new_profile.seeker_id
                    print(f"Created new job seeker profile with ID: {specific_id}")
                except Exception as e:
                    print(f"Error creating job seeker profile during login: {str(e)}")
                    # Create a more basic profile - last resort
                    try:
                        new_profile = JobSeeker(user_id=user.user_id)
                        db.add(new_profile)
                        db.commit()
                        db.refresh(new_profile)
                        specific_id = new_profile.seeker_id
                        print(f"Created basic job seeker profile with ID: {specific_id}")
                    except Exception as e2:
                        print(f"Failed to create even basic profile: {str(e2)}")
                        # Continue with None specific_id
        
        elif user.role == "recruiter":
            agency = db.query(RecruitmentAgency).filter(RecruitmentAgency.user_id == user.user_id).first()
            if agency:
                specific_id = agency.agency_id
                print(f"Found existing agency profile with ID: {specific_id}")
                
            # If no agency profile exists, create one
            if not agency:
                try:
                    new_profile = RecruitmentAgency(
                        user_id=user.user_id,
                        agency_name=user.name or "Agency",  # Use name from user data
                        agency_location="Not specified",  # Placeholder
                        license_number=f"TMP-{user.user_id}"  # Temporary license
                    )
                    db.add(new_profile)
                    db.commit()
                    db.refresh(new_profile)
                    specific_id = new_profile.agency_id
                    print(f"Created new agency profile with ID: {specific_id}")
                except Exception as e:
                    print(f"Error creating agency profile during login: {str(e)}")
                    # Continue with None specific_id
        
        # Check that we have a specific_id - this is critical
        if specific_id is None:
            print(f"WARNING: No specific_id found for user: {user.email}, role: {user.role}")
            # Try one more time to get or create profile ID
            if user.role == "job_seeker":
                try:
                    # Force create a new profile as a last resort
                    emergency_profile = JobSeeker(user_id=user.user_id)
                    db.add(emergency_profile)
                    db.commit()
                    db.refresh(emergency_profile)
                    specific_id = emergency_profile.seeker_id
                    print(f"Emergency creation of job seeker profile with ID: {specific_id}")
                except Exception as e:
                    print(f"Emergency profile creation failed: {str(e)}")
        
        # Include the specific ID in the token
        access_token = create_access_token({
            "sub": user.email, 
            "role": user.role, 
            "user_id": user.user_id,
            "specific_id": specific_id
        })
        
        # Create response with guaranteed specific_id (even if it's null)
        response_data = {
            "access_token": access_token, 
            "token_type": "bearer", 
            "role": user.role, 
            "user_id": user.user_id,
            "specific_id": specific_id
        }
        
        print(f"Login response data: {response_data}")
        
        return response_data
        
    except Exception as e:
        # Log any unexpected errors
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")