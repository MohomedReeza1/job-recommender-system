import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyPostedJobs } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/MyPostedJobs.css";

const MyPostedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if not logged in as a recruiter
    if (!user || user.role !== "recruiter") {
      navigate("/employer-login");
      return;
    }

    const loadJobs = async () => {
      try {
        setLoading(true);
        const jobsData = await fetchMyPostedJobs();
        setJobs(jobsData);
        setError(null);
      } catch (err) {
        console.error("Error loading jobs:", err);
        setError("Failed to load your posted jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [user, navigate]);

  const handleEditJob = (jobId) => {
    navigate(`/edit-job/${jobId}`);
  };

  const handleViewApplicants = (jobId) => {
    navigate(`/view-applicants/${jobId}`);
  };

  if (loading) {
    return <div className="my-jobs-container loading">Loading your posted jobs...</div>;
  }

  if (error) {
    return (
      <div className="my-jobs-container error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="my-jobs-container">
      <h2>My Posted Jobs</h2>
      
      <div className="action-bar">
        <button 
          className="post-job-btn"
          onClick={() => navigate("/post-job")}
        >
          Post a New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="no-jobs">
          <p>You haven't posted any jobs yet.</p>
          <p>Start by posting your first job opening!</p>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div key={job.job_id} className="job-card">
              <div className="job-header">
                <h3>{job.job_title}</h3>
                <span className="country-badge">{job.country}</span>
              </div>
              
              <div className="job-details">
                <p className="job-description">{job.job_description}</p>
                <p><strong>Skills Required:</strong> {job.skills_required}</p>
                
                {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
                
                <div className="job-meta">
                  <span><strong>Posted:</strong> {new Date(job.created_at).toLocaleDateString()}</span>
                  {job.available_quantity && (
                    <span><strong>Available Positions:</strong> {job.available_quantity}</span>
                  )}
                </div>
              </div>
              
              <div className="job-actions">
                <button 
                  className="view-applicants-btn"
                  onClick={() => handleViewApplicants(job.job_id)}
                >
                  View Applicants
                </button>
                <button 
                  className="edit-btn"
                  onClick={() => handleEditJob(job.job_id)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPostedJobs;