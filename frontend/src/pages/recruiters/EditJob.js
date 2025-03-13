import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobDetails, updateJob } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/PostJob.css"; // Reusing the existing styling

const EditJob = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    job_title: "",
    country: "",
    job_description: "",
    skills_required: "",
    experience_required: "",
    age_required: "",
    salary: "",
    working_hours: "",
    facilities: "",
    looking_gender: "",
    num_of_job_seekers_required: "",
    available_quantity: ""
  });

  useEffect(() => {
    if (!user || user.role !== "recruiter") {
      navigate("/employer-login");
      return;
    }

    // Fetch job details
    const fetchJob = async () => {
      try {
        setLoading(true);
        const jobData = await fetchJobDetails(jobId);
        
        // Convert any null values to empty strings for the form
        const sanitizedData = Object.entries(jobData).reduce((acc, [key, value]) => {
          acc[key] = value === null ? "" : value;
          return acc;
        }, {});
        
        setFormData(sanitizedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load job details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Convert numeric fields from strings to numbers
      const jobData = { ...formData };
      
      if (jobData.num_of_job_seekers_required) {
        jobData.num_of_job_seekers_required = parseInt(jobData.num_of_job_seekers_required, 10);
      }
      
      if (jobData.available_quantity) {
        jobData.available_quantity = parseInt(jobData.available_quantity, 10);
      }
      
      await updateJob(jobId, jobData);
      alert("Job updated successfully!");
      navigate("/my-posted-jobs");
    } catch (error) {
      console.error("Error updating job:", error);
      alert(error.response?.data?.detail || "Failed to update job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.job_title) {
    return <div className="post-job-container">Loading job details...</div>;
  }

  if (error) {
    return (
      <div className="post-job-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/my-posted-jobs")}>Back to My Jobs</button>
      </div>
    );
  }

  return (
    <div className="post-job-container">
      <h2>Edit Job: {formData.job_title}</h2>
      
      <form onSubmit={handleSubmit} className="post-job-form">
        <div className="form-group">
          <label htmlFor="job_title">Job Title *</label>
          <input
            type="text"
            id="job_title"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="country">Country *</label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          >
            <option value="">Select Country</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="Qatar">Qatar</option>
            <option value="UAE">UAE</option>
            <option value="Kuwait">Kuwait</option>
            <option value="Bahrain">Bahrain</option>
            <option value="Oman">Oman</option>
            <option value="Jordan">Jordan</option>
            <option value="Malaysia">Malaysia</option>
            <option value="Singapore">Singapore</option>
            <option value="Cyprus">Cyprus</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="job_description">Job Description *</label>
          <textarea
            id="job_description"
            name="job_description"
            value={formData.job_description}
            onChange={handleChange}
            rows="5"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="skills_required">Skills Required *</label>
          <textarea
            id="skills_required"
            name="skills_required"
            value={formData.skills_required}
            onChange={handleChange}
            rows="3"
            required
          ></textarea>
          <small>Enter skills separated by commas</small>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="experience_required">Experience Required</label>
            <input
              type="text"
              id="experience_required"
              name="experience_required"
              value={formData.experience_required}
              onChange={handleChange}
              placeholder="e.g. 2 years"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="age_required">Age Requirement</label>
            <input
              type="text"
              id="age_required"
              name="age_required"
              value={formData.age_required}
              onChange={handleChange}
              placeholder="e.g. 25-40"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="salary">Salary</label>
            <input
              type="text"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g. $500-700/month"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="working_hours">Working Hours</label>
            <input
              type="text"
              id="working_hours"
              name="working_hours"
              value={formData.working_hours}
              onChange={handleChange}
              placeholder="e.g. 8 hours/day, 6 days/week"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="facilities">Facilities Provided</label>
          <textarea
            id="facilities"
            name="facilities"
            value={formData.facilities}
            onChange={handleChange}
            rows="3"
            placeholder="e.g. Accommodation, Food, Transportation, etc."
          ></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="looking_gender">Gender Preference</label>
            <select
              id="looking_gender"
              name="looking_gender"
              value={formData.looking_gender}
              onChange={handleChange}
            >
              <option value="">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="num_of_job_seekers_required">Number of Positions</label>
            <input
              type="number"
              id="num_of_job_seekers_required"
              name="num_of_job_seekers_required"
              value={formData.num_of_job_seekers_required}
              onChange={handleChange}
              min="1"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="available_quantity">Available Positions</label>
            <input
              type="number"
              id="available_quantity"
              name="available_quantity"
              value={formData.available_quantity}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate("/my-posted-jobs")} 
            className="cancel-btn"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Job"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;