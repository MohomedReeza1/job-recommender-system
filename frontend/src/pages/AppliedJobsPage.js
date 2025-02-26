import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import '../styles/ApplyJobPages.css';

const AppliedJobsPage = () => {
  const auth = useAuth();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const { user } = auth || {};
  const seekerId = user?.seeker_id;

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!seekerId) return;
      try {
        const response = await api.get(`/applied-jobs/${seekerId}`);
        setAppliedJobs(response.data);
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
      }
    };
    fetchAppliedJobs();
  }, [seekerId]);

  return (
    <div className="applied-jobs-page">
      <h2>Applied Jobs</h2>
      <ul>
        {appliedJobs.map((job) => (
          <li key={job.job_id}>
            <h3>{job.job_title}</h3>
            <p>{job.country}</p>
            <p>Applied on: {new Date(job.applied_at).toLocaleDateString()}</p>
            {job.cv_filename && <p><a href={`/uploads/${job.cv_filename}`} download>Download CV</a></p>}
            {job.cover_letter_filename && <p><a href={`/uploads/${job.cover_letter_filename}`} download>Download Cover Letter</a></p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AppliedJobsPage;
