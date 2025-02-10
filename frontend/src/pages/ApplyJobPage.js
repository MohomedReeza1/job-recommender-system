import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import '../styles/ApplyJobPages.css';

const ApplyJobPage = ({ isFromRecommendations }) => {
  const { jobId } = useParams();
  const [jobDetails, setJobDetails] = useState(null);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await api.get(`/jobs/${jobId}`);
        setJobDetails(response.data);
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, name: value });
  };

  const handleApply = async () => {
    try {
      await api.post("/apply-job/", {
        seeker_id: 1, // Use the actual user ID
        job_id: jobId,
      });
      alert("Applied successfully!");
      navigate("/applied-jobs");
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Failed to apply.");
    }
  };

  return (
    <div className="apply-job-page">
      {jobDetails && (
        <>
          <h2>{jobDetails.job_title}</h2>
          <p>{jobDetails.job_description}</p>
          <p>Country: {jobDetails.country}</p>
          <p>Skills Required: {jobDetails.skills_required}</p>
          <p>Salary: {jobDetails.salary}</p>
          {!isFromRecommendations && (
            <div>
              <h3>Enter Your Details</h3>
              <input
                type="text"
                placeholder="Name"
                name="name"
                onChange={handleChange}
              />
              {/* Add other fields as required */}
            </div>
          )}
          <button onClick={handleApply}>Confirm Apply</button>
        </>
      )}
    </div>
  );
};

export default ApplyJobPage;
