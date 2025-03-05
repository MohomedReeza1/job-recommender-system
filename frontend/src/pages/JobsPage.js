import React, { useEffect, useState } from "react";
import { fetchJobs } from "../services/api";
import JobCard from "../components/JobCard";
import '../styles/JobsPage.css';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getJobs = async () => {
      try {
        setLoading(true);
        const jobsData = await fetchJobs();
        setJobs(jobsData);
        setError(null);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    getJobs();
  }, []);

  if (loading) {
    return <div className="jobs-container loading">Loading available jobs...</div>;
  }

  if (error) {
    return <div className="jobs-container error">{error}</div>;
  }

  return (
    <div className="jobs-container">
      <h2>Available Jobs</h2>
      <div className="jobs-list">
        {jobs.map((job) => (
          <JobCard key={job.job_id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default JobsPage;