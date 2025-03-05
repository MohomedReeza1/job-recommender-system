import React, { useEffect, useState } from "react";
import { fetchMyPostedJobs, deleteJob } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/MyPostedJobs.css";

const MyPostedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getPostedJobs = async () => {
      if (!user) {
        navigate("/employer-login");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching posted jobs...");
        const postedJobs = await fetchMyPostedJobs();
        console.log("Posted jobs:", postedJobs);
        setJobs(postedJobs || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching posted jobs:", err);
        setError("Failed to load your posted jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getPostedJobs();
  }, [user, navigate]);

  const handleViewApplicants = (jobId) => {
    if (!jobId) {
      alert("Invalid job ID. Cannot view applicants.");
      return;
    }
    navigate(`/view-applicants/${jobId}`);
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob(jobId);
        setJobs(jobs.filter(job => job.job_id !== jobId));
        alert("Job deleted successfully!");
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Failed to delete job. Please try again.");
      }
    }
  };

  const handleEditJob = (jobId) => {
    navigate(`/edit-job/${jobId}`);
  };

  if (loading) {
    return <div className="my-posted-jobs loading">Loading your posted jobs...</div>;
  }

  if (error) {
    return (
      <div className="my-posted-jobs error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="my-posted-jobs-container">
      <div className="header">
        <h2>My Posted Jobs</h2>
        <button className="post-job-btn" onClick={() => navigate("/post-job")}>
          Post a New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="no-jobs">
          <p>You haven't posted any jobs yet.</p>
          <button onClick={() => navigate("/post-job")}>Post Your First Job</button>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div key={job.job_id} className="job-item">
              <div className="job-header">
                <h3>{job.job_title}</h3>
                <span className="post-date">
                  Posted on: {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="job-details">
                <p><strong>Country:</strong> {job.country}</p>
                <p><strong>Skills Required:</strong> {job.skills_required}</p>
                {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
                {job.available_quantity !== undefined && (
                  <p>
                    <strong>Positions:</strong> {job.available_quantity} available
                    {job.num_of_job_seekers_required && ` of ${job.num_of_job_seekers_required}`}
                  </p>
                )}
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
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteJob(job.job_id)}
                >
                  Delete
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