import React, { useState } from "react";
import { fetchRecommendationsWithForm } from "../services/api";
import JobCard from "../components/JobCard";
import "../styles/RecommendationsPage.css";

const RecommendationsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: 0,
    height: 0,
    weight: 0,
    marital_status: "",
    num_of_children: 0,
    education: "",
    skills: "",
    interests: "",
    previous_jobs: "",
    looking_jobs: "",
    description: "",
    passport_status: "",
  });

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGetRecommendations = async () => {
    try {
      const response = await fetchRecommendationsWithForm(formData);
      setRecommendedJobs(response);
      setShowRecommendations(true);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      alert("Failed to get recommendations. Please try again.");
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: "",
      age: 0,
      gender: "",
      height: 0,
      weight: 0,
      marital_status: "",
      num_of_children: 0,
      education: "",
      skills: "",
      interests: "",
      previous_jobs: "",
      looking_jobs: "",
      description: "",
      passport_status: "",
    });
    setRecommendedJobs([]);
    setShowRecommendations(false);
  };

  return (
    <div className="recommendations-page">
      <h2>Get Your Job Recommendations</h2>
      <form className="recommendation-form">
        {/* Input fields */}
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Gender:</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Height (cm) :</label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Weight (kg) :</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Marital Status:</label>
          <select
            name="marital_status"
            value={formData.marital_status}
            onChange={handleChange}
            required
          >
            <option value="">Select Marital Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
          </select>
        </div>
        <div className="form-group">
          <label>Number of Children:</label>
          <input
            type="number"
            name="num_of_children"
            value={formData.num_of_children}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Education:</label>
          <select
            name="education"
            value={formData.education}
            onChange={handleChange}
            required
          >
            <option value="">Select Education Level</option>
            <option value="High School">High School</option>
            <option value="Diploma">Diploma</option>
            <option value="Degree">Degree</option>
          </select>
        </div>
        <div className="form-group">
          <label>Skills:</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Interests:</label>
          <input
            type="text"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Previous Jobs:</label>
          <input
            type="text"
            name="previous_jobs"
            value={formData.previous_jobs}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Looking Jobs:</label>
          <input
            type="text"
            name="looking_jobs"
            value={formData.looking_jobs}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Passport Status:</label>
          <select
            name="passport_status"
            value={formData.passport_status}
            onChange={handleChange}
            required
          >
            <option value="">Select Passport Status</option>
            <option value="Valid">Valid</option>
            <option value="Invalid">Invalid</option>
            <option value="Applied">Applied</option>
          </select>
        </div>
      </form>

      {/* Buttons */}
      <div className="buttons-container">
        <button onClick={handleGetRecommendations}>Get Recommendation</button>
        <button onClick={handleResetForm}>Reset</button>
      </div>

      {/* Recommended Jobs */}
      {showRecommendations && (
        <div className="recommendations-section">
          <h3>Recommended Jobs</h3>
          <div className="job-cards-container">
            {recommendedJobs.map((job) => (
              <JobCard key={job.job_id} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
