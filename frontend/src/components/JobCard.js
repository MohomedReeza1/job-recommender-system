import React from "react";
import '../styles/JobCard.css';

const JobCard = ({ job }) => {
    return (
      <div className="job-card">
        <h3>{job.job_title}</h3>
        <p>{job.job_description}</p>
        <p>Country : {job.country}</p>
        <p>Skills Required : {job.skills_required}</p>
        <p>Salary : {job.salary}</p>
        <button>Apply Now</button>
      </div>
    );
  };  

export default JobCard;
