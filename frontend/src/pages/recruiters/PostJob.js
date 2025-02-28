import React, { useState, useEffect } from "react";
import { postJob } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/PostJob.css";

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agencyId, setAgencyId] = useState(null);
  
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
    // Redirect if not logged in as a recruiter
    if (!user || user.role !== "recruiter") {
      navigate("/employer-login");
      return;
    }

    // Fetch the agency ID for the current recruiter
    const fetchAgencyId = async () => {
      try {
        // In a real implementation, you would fetch the agency profile and get the ID
        // For now, we'll use a mock approach
        // This is a placeholder for the actual API call to get the recruiter's agency ID
        // const response = await fetchRecruiterProfile(user.user_id);
        // setAgencyId(response.agency_id);
        
        // Mock ID for testing (would be replaced with real API call)
        setAgencyId(user.user_id);
      } catch (error) {
        console.error("Error fetching agency ID:", error);
        alert("Error setting up job posting form. Please try again later.");
      }
    };

    fetchAgencyId();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!agencyId) {
      alert("Unable to identify your agency. Please update your profile first.");
      return;
    }
    
    try {
      setLoading(true);
      
      // Add the recruiter_id to the form data
      const jobData = {
        ...formData,
        recruiter_id: agencyId
      };
      
      // Convert numeric fields from strings to numbers
      if (jobData.num_of_job_seekers_required) {
        jobData.num_of_job_seekers_required = parseInt(jobData.num_of_job_seekers_required, 10);
      }
      
      if (jobData.available_quantity) {
        jobData.available_quantity = parseInt(jobData.available_quantity, 10);
      }
      
      await postJob(jobData);
      alert("Job posted successfully!");
      navigate("/my-posted-jobs");
    } catch (error) {
      console.error("Error posting job:", error);
      alert(error.response?.data?.detail || "Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-container">
      <h2>Post a New Job</h2>
      
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
          <button type="button" onClick={() => navigate("/my-posted-jobs")} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Posting..." : "Post Job"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;