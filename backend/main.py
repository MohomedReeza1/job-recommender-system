from fastapi import FastAPI
from database import Base, engine
from routers import jobs, seekers, recommendations
from fastapi.middleware.cors import CORSMiddleware

# Initialize database
Base.metadata.create_all(bind=engine)

# Initialize app
app = FastAPI()

# Include routers
app.include_router(jobs.router, prefix="/api", tags=["Jobs"])
app.include_router(seekers.router, prefix="/api", tags=["Job Seekers"])
app.include_router(recommendations.router, prefix="/api", tags=["Recommendations"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers (e.g., Content-Type)
)
