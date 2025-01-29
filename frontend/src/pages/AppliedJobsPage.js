import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import '../styles/ApplyJobPages.css';

const AppliedJobsPage = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);

useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const response = await api.get("/applied-jobs/1"); // Use correct seeker ID
        console.log("API Response:", response.data); // Debug the response
        setAppliedJobs(response.data); // Update the state
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
      }
    };
  
    fetchAppliedJobs();
  }, []);
  
  console.log("Applied Jobs State:", appliedJobs); // Check state updates

return (
    <div className="applied-jobs-page">
      <h2>Applied Jobs</h2>
      {appliedJobs && appliedJobs.length > 0 ? (
        <ul style={{ display: "block" }}>
          {appliedJobs.map((job) => (
            <li key={job.job_id}>
              <h3>{job.job_title}</h3>
              <p>{job.country}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No jobs applied yet.</p>
      )}
    </div>
  );
  
};

export default AppliedJobsPage;
