import React from "react";
import '../styles/JobCard.css';
import { useNavigate } from "react-router-dom";

// const JobCard = ({ job }) => {
//     return (
//       <div className="job-card">
//         <h3>{job.job_title}</h3>
//         <p>{job.job_description}</p>
//         <p>Country : {job.country}</p>
//         <p>Skills Required : {job.skills_required}</p>
//         <p>Salary : {job.salary}</p>
//         <button>Apply Now</button>
//       </div>
//     );
//   };  


const JobCard = ({ job, isFromRecommendations }) => {
  const navigate = useNavigate();

  const handleViewJob = () => {
    navigate(`/apply-job/${job.job_id}`, {
      state: { isFromRecommendations },
    });
  };

  return (
    <div className="job-card">
      <h3>{job.job_title}</h3>
      <p>{job.job_description}</p>
      <button onClick={handleViewJob}>View Job</button>
    </div>
  );
};

export default JobCard;


