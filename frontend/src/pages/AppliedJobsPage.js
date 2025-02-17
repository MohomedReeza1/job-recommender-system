import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import '../styles/ApplyJobPages.css';

const AppliedJobsPage = () => {
  const auth = useAuth(); 

  // ✅ Move Hooks to the top level
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Add loading state

  const { user } = auth || {};  // ✅ Ensure auth is not null
  const seekerId = user?.seeker_id; 

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!seekerId) {
        setLoading(false); // Stop loading if no seekerId
        return;
      }

      try {
        const response = await api.get(`/applied-jobs/${seekerId}`);
        setAppliedJobs(response.data);
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
      } finally {
        setLoading(false); // ✅ Ensure loading stops
      }
    };

    fetchAppliedJobs();
  }, [seekerId]); 

  if (loading) return <p>Loading...</p>; // ✅ Show loading state while fetching

  return (
    <div className="applied-jobs-page">
      <h2>Applied Jobs</h2>
      {appliedJobs.length > 0 ? (
        <ul>
          {appliedJobs.map((job) => (
            <li key={job.job_id}>
              <h3>{job.job_title}</h3>
              <p>{job.country}</p>
              <p>Applied on: {new Date(job.applied_at).toLocaleDateString()}</p>
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
