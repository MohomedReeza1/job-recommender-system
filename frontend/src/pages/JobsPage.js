import React, { useEffect, useState } from "react";
import { fetchJobs } from "../services/api";
import JobCard from "../components/JobCard";
import '../styles/JobsPage.css';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
      const getJobs = async () => {
          try {
              const jobsData = await fetchJobs();
              setJobs(jobsData);
          } catch (error) {
              console.error("Error fetching jobs:", error);
          }
      };
  
      getJobs();
  }, []);

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



