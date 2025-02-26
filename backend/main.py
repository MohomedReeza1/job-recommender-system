from fastapi import FastAPI
from database import Base, engine
from routers import jobs, seekers, recommendations, auth, recruiters
from fastapi.middleware.cors import CORSMiddleware

# Initialize database
Base.metadata.create_all(bind=engine)

# Initialize app
app = FastAPI()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(jobs.router, prefix="/api", tags=["Jobs"])
app.include_router(seekers.router, prefix="/api", tags=["Job Seekers"])
app.include_router(recommendations.router, prefix="/api", tags=["Recommendations"])
app.include_router(recruiters.router, prefix="/api", tags=["Recruiters"])


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)