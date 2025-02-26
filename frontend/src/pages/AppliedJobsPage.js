import React, { useEffect, useState } from "react";
import { fetchAppliedJobs } from "../services/api";
import { useAuth } from "../context/AuthContext";
import '../styles/AppliedJobsPage.css';
import { Link } from "react-router-dom";

const AppliedJobsPage = () => {
  const { user } = useAuth();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAppliedJobs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log("Fetching applied jobs for user ID:", user.user_id);
        const jobs = await fetchAppliedJobs(user.user_id);
        console.log("Applied jobs fetched:", jobs);
        setAppliedJobs(jobs || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching applied jobs:", err);
        setError("Failed to load your applied jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getAppliedJobs();
  }, [user]);

  if (loading) {
    return <div className="applied-jobs-page loading">Loading your applications...</div>;
  }

  if (error) {
    return (
      <div className="applied-jobs-page error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (appliedJobs.length === 0) {
    return (
      <div className="applied-jobs-page empty">
        <h2>Applied Jobs</h2>
        <p className="no-jobs-message">You haven't applied to any jobs yet.</p>
        <Link to="/jobs" className="browse-jobs-btn">Browse Jobs</Link>
      </div>
    );
  }

  return (
    <div className="applied-jobs-page">
      <h2>Applied Jobs</h2>
      <div className="applied-jobs-list">
        {appliedJobs.map((job) => (
          <div key={`${job.job_id}-${job.applied_at}`} className="applied-job-card">
            <h3>{job.job_title}</h3>
            <div className="job-details">
              <p><strong>Country:</strong> {job.country}</p>
              <p><strong>Applied on:</strong> {new Date(job.applied_at).toLocaleDateString()}</p>
              
              <div className="application-documents">
                {job.cv_filename && (
                  <a 
                    href={`http://localhost:8000/uploads/${job.cv_filename}`} 
                    download={job.cv_filename.split('_').slice(1).join('_')} 
                    className="download-link"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(`http://localhost:8000/uploads/${job.cv_filename}`, '_blank');
                    }}
                  >
                    View CV
                  </a>
                )}
                
                {job.cover_letter_filename && (
                  <a 
                    href={`http://localhost:8000/uploads/${job.cover_letter_filename}`}
                    download={job.cover_letter_filename.split('_').slice(1).join('_')}
                    className="download-link"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(`http://localhost:8000/uploads/${job.cover_letter_filename}`, '_blank');
                    }}
                  >
                    View Cover Letter
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppliedJobsPage;