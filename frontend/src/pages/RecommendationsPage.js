// import React, { useEffect, useState } from "react";
// import { fetchRecommendations } from "../services/api";
// import JobCard from "../components/JobCard";

// const RecommendationsPage = () => {
//   const [recommendedJobs, setRecommendedJobs] = useState([]);
//   const userId = 1; // Replace with actual logged-in user ID

//   useEffect(() => {
//     const getRecommendations = async () => {
//       try {
//         const recommendations = await fetchRecommendations(userId);
//         setRecommendedJobs(recommendations);
//       } catch (error) {
//         console.error("Error fetching recommendations:", error);
//       }
//     };

//     getRecommendations();
//   }, [userId]);

//   return (
//     <div>
//       <h2>Your Job Recommendations</h2>
//       {recommendedJobs.map((job) => (
//         <JobCard key={job.id} job={job} />
//       ))}
//     </div>
//   );
// };

// export default RecommendationsPage;


import React, { useState } from "react";
import { api } from "../services/api";

const RecommendationsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    marital_status: "",
    num_of_children: "",
    education: "",
    skills: "",
    interests: "",
    previous_jobs: "",
    looking_jobs: "",
    description: "",
    passport_status: "",
  });

  const [recommendedJobs, setRecommendedJobs] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/recommendations/", formData);
      setRecommendedJobs(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  return (
    <div>
      <h2>Get Your Job Recommendations</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label>
              {key.replace("_", " ").toUpperCase()}:
              <input
                type={key === "age" || key === "height" || key === "weight" || key === "num_of_children" ? "number" : "text"}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                required
              />
            </label>
          </div>
        ))}
        <button type="submit">Get Recommendations</button>
      </form>

      <h3>Recommended Jobs</h3>
      {recommendedJobs.map((job) => (
        <div key={job.job_id}>
          <h4>{job.job_title}</h4>
          <p>{job.job_description}</p>
        </div>
      ))}
    </div>
  );
};

export default RecommendationsPage;
