import pickle
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from models import JobSeeker, Job
from sklearn.preprocessing import MinMaxScaler

# Load pre-trained ML models
try:
    tfidf_vectorizer = pickle.load(open("ml_model/tfidf_vectorizer.pkl", "rb"))
    svd_model = pickle.load(open("ml_model/svd_model.pkl", "rb"))
    predicted_matrix = pickle.load(open("ml_model/predicted_matrix_test.pkl", "rb"))
except FileNotFoundError as e:
    print("Error loading ML model files:", e)

def get_top_recommendations(seeker_id: int, db: Session, top_n: int = 3):
    """
    Generates job recommendations for an existing user using the hybrid model.
    """
    seeker = db.query(JobSeeker).filter(JobSeeker.seeker_id == seeker_id).first()
    if not seeker:
        return []

    # Create seeker profile text
    seeker_profile = f"{seeker.skills} {seeker.interests} {seeker.previous_jobs} {seeker.looking_jobs}"
    seeker_vector = tfidf_vectorizer.transform([seeker_profile])

    # Compute content-based similarity
    jobs = db.query(Job).all()
    job_descriptions = [job.job_description for job in jobs]
    job_vectors = tfidf_vectorizer.transform(job_descriptions)
    similarity_scores = cosine_similarity(seeker_vector, job_vectors).flatten()

    # Retrieve job IDs
    job_ids = [job.job_id for job in jobs]

    # Get collaborative filtering scores
    collab_scores = predicted_matrix.mean(axis=0)  # Aggregate user predictions
    scaler = MinMaxScaler()
    similarity_scores_scaled = scaler.fit_transform(similarity_scores.reshape(-1, 1)).flatten()
    # collab_scores_scaled = scaler.fit_transform(collab_scores.reshape(-1, 1)).flatten()
    collab_scores_scaled = scaler.fit_transform(np.array(collab_scores).reshape(-1, 1)).flatten()

    # Ensure both arrays have the same shape
    similarity_scores_scaled = similarity_scores_scaled[:len(collab_scores_scaled)]

    # Compute hybrid scores
    hybrid_scores = (0.5 * similarity_scores_scaled) + (0.5 * collab_scores_scaled)

    # Get top job recommendations
    top_job_indices = hybrid_scores.argsort()[-top_n:][::-1]
    recommended_jobs = [job_ids[idx] for idx in top_job_indices]

    return db.query(Job).filter(Job.job_id.in_(recommended_jobs)).all()


# def get_top_recommendations_from_data(seeker_data: dict, db: Session, top_n: int = 3):
#     """
#     Generates job recommendations for a new user using their input profile data.
#     """
#     seeker_profile = f"{seeker_data['skills']} {seeker_data['interests']} {seeker_data['previous_jobs']} {seeker_data['looking_jobs']}"
#     seeker_vector = tfidf_vectorizer.transform([seeker_profile])

#     # Compute content-based similarity
#     jobs = db.query(Job).all()
#     job_descriptions = [job.job_description for job in jobs]
#     job_vectors = tfidf_vectorizer.transform(job_descriptions)
#     similarity_scores = cosine_similarity(seeker_vector, job_vectors).flatten()

#     # Retrieve job IDs
#     job_ids = [job.job_id for job in jobs]

#     # Get collaborative filtering scores
#     collab_scores = predicted_matrix.mean(axis=0)
#     scaler = MinMaxScaler()
#     similarity_scores_scaled = scaler.fit_transform(similarity_scores.reshape(-1, 1)).flatten()
#     collab_scores_scaled = scaler.fit_transform(np.array(collab_scores).reshape(-1, 1)).flatten()

#     # Ensure both arrays have the same shape
#     similarity_scores_scaled = similarity_scores_scaled[:len(collab_scores_scaled)]

#     # Compute hybrid scores
#     hybrid_scores = (0.5 * similarity_scores_scaled) + (0.5 * collab_scores_scaled)

#     # Get top job recommendations
#     top_job_indices = hybrid_scores.argsort()[-top_n:][::-1]
#     recommended_jobs = [job_ids[idx] for idx in top_job_indices]

#     return db.query(Job).filter(Job.job_id.in_(recommended_jobs)).all()

def get_top_recommendations_from_data(seeker_data: dict, db: Session, top_n: int = 3):
    """
    Generate job recommendations for a new user based on their profile data.
    """
    # Create profile text from user input
    seeker_profile = f"{seeker_data['skills']} {seeker_data['interests']} {seeker_data['previous_jobs']} {seeker_data['looking_jobs']}"
    
    # Get jobs from database
    jobs = db.query(Job).all()
    
    # Check if there are any jobs in the database
    if not jobs:
        return []
    
    # Generate content-based recommendations only if no jobs data exists
    job_descriptions = [job.job_description for job in jobs]
    
    # Vectorize the text data
    try:
        seeker_vector = tfidf_vectorizer.transform([seeker_profile])
        job_vectors = tfidf_vectorizer.transform(job_descriptions)
        
        # Calculate content-based similarity
        similarity_scores = cosine_similarity(seeker_vector, job_vectors).flatten()
        
        # Get job IDs
        job_ids = [job.job_id for job in jobs]
        
        # Normalize the similarity scores
        scaler = MinMaxScaler()
        similarity_scores_scaled = scaler.fit_transform(similarity_scores.reshape(-1, 1)).flatten()
        
        # Sort jobs by similarity and return top matches
        top_indices = similarity_scores.argsort()[-top_n:][::-1]
        recommended_jobs = [job_ids[idx] for idx in top_indices]
        
        return db.query(Job).filter(Job.job_id.in_(recommended_jobs)).all()
        
    except Exception as e:
        print(f"Error in recommendation system: {str(e)}")
        return []