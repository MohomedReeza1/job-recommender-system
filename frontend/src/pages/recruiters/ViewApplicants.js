import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobDetails, fetchJobApplicants, getUploadsBaseUrl } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/ViewApplicants.css";

const ViewApplicants = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "recruiter") {
      navigate("/employer-login");
      return;
    }

    // Check if jobId is valid
    if (!jobId || jobId === "undefined") {
      setError("Invalid job ID. Please select a valid job.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch job details
        const jobData = await fetchJobDetails(jobId);
        setJob(jobData);

        // Fetch applicants for this job
        const applicantsData = await fetchJobApplicants(jobId);
        setApplicants(applicantsData);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load job applicants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, user, navigate]);

  const handleViewDetails = (applicant) => {
    setSelectedApplicant(applicant);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
  };

  const handleContact = (email) => {
    window.location.href = `mailto:${email}`;
  };

  const handleViewDocument = (filename) => {
    if (filename) {
      window.open(`${getUploadsBaseUrl()}/uploads/${filename}`, '_blank');
    }
  };

  if (loading) {
    return <div className="view-applicants loading">Loading applicants data...</div>;
  }

  if (error) {
    return (
      <div className="view-applicants error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/my-posted-jobs")} className="back-btn">
          Back to My Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="view-applicants-container">
      {job && (
        <div className="job-header">
          <h2>Applicants for: {job.job_title}</h2>
          <div className="job-summary">
            <p><strong>Country:</strong> {job.country}</p>
            <p><strong>Posted Date:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
            {job.available_quantity && (
              <p><strong>Available Positions:</strong> {job.available_quantity}</p>
            )}
          </div>
          <button className="back-btn" onClick={() => navigate("/my-posted-jobs")}>
            Back to My Jobs
          </button>
        </div>
      )}

      <div className="applicants-section">
        {applicants.length === 0 ? (
          <div className="no-applicants">
            <p>No applications have been received for this job yet.</p>
          </div>
        ) : (
          <>
            <h3>Total Applicants: {applicants.length}</h3>
            <div className="applicants-list">
              {applicants.map((applicant) => (
                <div key={applicant.application_id} className="applicant-card">
                  <div className="applicant-info">
                    <h4>{applicant.name || "Applicant"}</h4>
                    <p><strong>Applied:</strong> {new Date(applicant.applied_at).toLocaleDateString()}</p>
                    {applicant.skills && (
                      <p className="skills"><strong>Skills:</strong> {applicant.skills}</p>
                    )}
                  </div>
                  <div className="applicant-actions">
                    <button 
                      className="view-details-btn"
                      onClick={() => handleViewDetails(applicant)}
                    >
                      View Details
                    </button>
                    {applicant.cv_filename && (
                      <button 
                        className="view-cv-btn"
                        onClick={() => handleViewDocument(applicant.cv_filename)}
                      >
                        View CV
                      </button>
                    )}
                    {applicant.cover_letter_filename && (
                      <button 
                        className="view-letter-btn"
                        onClick={() => handleViewDocument(applicant.cover_letter_filename)}
                      >
                        View Cover Letter
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Applicant Details Modal */}
      {showDetails && selectedApplicant && (
        <div className="applicant-modal-overlay">
          <div className="applicant-modal">
            <button className="close-modal" onClick={closeDetails}>×</button>
            <h3>{selectedApplicant.name || "Applicant Details"}</h3>
            
            <div className="applicant-details">
              <div className="detail-group">
                <label>Applied On:</label>
                <p>{new Date(selectedApplicant.applied_at).toLocaleString()}</p>
              </div>
              
              {selectedApplicant.email && (
                <div className="detail-group">
                  <label>Email:</label>
                  <p>{selectedApplicant.email}</p>
                </div>
              )}
              
              {selectedApplicant.skills && (
                <div className="detail-group">
                  <label>Skills:</label>
                  <p>{selectedApplicant.skills}</p>
                </div>
              )}
              
              {selectedApplicant.experience && (
                <div className="detail-group">
                  <label>Experience:</label>
                  <p>{selectedApplicant.experience}</p>
                </div>
              )}
              
              {selectedApplicant.education && (
                <div className="detail-group">
                  <label>Education:</label>
                  <p>{selectedApplicant.education}</p>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              {selectedApplicant.email && (
                <button 
                  className="contact-btn"
                  onClick={() => handleContact(selectedApplicant.email)}
                >
                  Contact Applicant
                </button>
              )}
              {selectedApplicant.cv_filename && (
                <button 
                  className="view-cv-btn"
                  onClick={() => handleViewDocument(selectedApplicant.cv_filename)}
                >
                  View CV
                </button>
              )}
              {selectedApplicant.cover_letter_filename && (
                <button 
                  className="view-letter-btn"
                  onClick={() => handleViewDocument(selectedApplicant.cover_letter_filename)}
                >
                  View Cover Letter
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewApplicants;