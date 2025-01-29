import pickle
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from models import JobSeeker, Job 
from sklearn.feature_extraction.text import TfidfVectorizer


# Load pre-trained ML models
try:
    tfidf_vectorizer = pickle.load(open("ml_model/tfidf_vectorizer.pkl", "rb"))
except FileNotFoundError as e:
    print("Error loading TF-IDF model:", e)
#     tfidf_vectorizer = None

def get_top_recommendations(seeker_id: int, db: Session, top_n: int = 6):
    # Fetch seeker data
    seeker = db.query(JobSeeker).filter(JobSeeker.seeker_id == seeker_id).first()
    if not seeker:
        return []

    # Combine seeker profile data for vectorization
    seeker_profile = f"{seeker.skills} {seeker.interests} {seeker.previous_jobs} {seeker.looking_jobs}"
    seeker_vector = tfidf_vectorizer.transform([seeker_profile])

    # Vectorize all job descriptions
    jobs = db.query(Job).all()
    job_descriptions = [job.job_description for job in jobs]
    job_vectors = tfidf_vectorizer.transform(job_descriptions)

    # Calculate similarity scores
    similarity_scores = cosine_similarity(seeker_vector, job_vectors)

    # Get top N job indices
    top_indices = similarity_scores[0].argsort()[::-1][:top_n]

    # Fetch corresponding jobs from the database
    recommended_jobs = [jobs[i] for i in top_indices]
    return recommended_jobs


def get_top_recommendations_from_data(seeker_data: dict, db: Session, top_n: int = 6):
    seeker_profile = f"{seeker_data['skills']} {seeker_data['interests']} {seeker_data['previous_jobs']} {seeker_data['looking_jobs']}"
    seeker_vector = tfidf_vectorizer.transform([seeker_profile])
    jobs = db.query(Job).all()
    job_descriptions = [job.job_description for job in jobs]
    job_vectors = tfidf_vectorizer.transform(job_descriptions)
    similarity_scores = cosine_similarity(seeker_vector, job_vectors)
    top_indices = similarity_scores[0].argsort()[::-1][:top_n]
    return [jobs[i] for i in top_indices]
