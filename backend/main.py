from fastapi import FastAPI
from database import Base, engine
from routers import jobs, seekers, recommendations, auth, recruiters
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

Base.metadata.create_all(bind=engine)

# Initialize app
app = FastAPI()

# Mount the uploads directory to serve files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(jobs.router, prefix="/api", tags=["Jobs"])
app.include_router(seekers.router, prefix="/api", tags=["Job Seekers"])
app.include_router(recommendations.router, prefix="/api", tags=["Recommendations"])
app.include_router(recruiters.router, prefix="/api", tags=["Recruiters"])

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # React app origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers (e.g., Content-Type)
)

