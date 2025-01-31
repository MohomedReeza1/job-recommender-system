import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJobs } from "../services/api"; 
import "../styles/Home.css";
import "../styles/JobCard.css";
import heroImage from "../assets/hero3.jpg"; 
import jobIcon1 from "../assets/job-icon1.png";
import jobIcon2 from "../assets/job-icon2.png";
import jobIcon3 from "../assets/job-icon3.png";
import jobIcon4 from "../assets/job-icon4.png";

const Home = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const getJobs = async () => {
      try {
        const jobData = await fetchJobs();
        setJobs(jobData.slice(0, 4));
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    getJobs();
  }, []);

  return (
    <div className="home-container">
      
      {/* Hero Section */}
      <div className="hero-section">
        <img src={heroImage} alt="Handshake" className="hero-image" />
        <div className="hero-overlay">
          <h1>Find Your Perfect Job</h1>
          <p>Get job recommendations that match your skills and interests.</p>
          <button className="cta-button" onClick={() => navigate("/jobs")}>
            Explore Jobs
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step">
            <span>1</span>
            <h3>Create a Profile</h3>
            <p>Tell us about your skills, interests, and experience.</p>
          </div>
          <div className="step">
            <span>2</span>
            <h3>Get Job Matches</h3>
            <p>We recommend jobs based on your profile.</p>
          </div>
          <div className="step">
            <span>3</span>
            <h3>Apply & Get Hired</h3>
            <p>Apply to jobs and get hired quickly.</p>
          </div>
        </div>
      </div>

      {/* Featured Job Categories */}
      <div className="featured-categories">
        <h2>Popular Job Categories</h2>
        <div className="categories-grid">
          <div className="category">
            <img src={jobIcon1} alt="Housekeeping Jobs" />
            <h4>Housekeeping</h4>
            <p>Find domestic jobs with trusted employers.</p>
          </div>
          <div className="category">
            <img src={jobIcon2} alt="Construction Jobs" />
            <h4>Construction</h4>
            <p>Opportunities in skilled and unskilled labor.</p>
          </div>
          <div className="category">
            <img src={jobIcon3} alt="Driver Jobs" />
            <h4>Driving</h4>
            <p>Drive for logistics, transport, and delivery companies.</p>
          </div>
          <div className="category">
            <img src={jobIcon4} alt="Hospitality Jobs" />
            <h4>Hospitality</h4>
            <p>Work in hotels, restaurants, and catering services.</p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="why-choose-us">
        <h2>Why Choose Our Platform?</h2>
        <ul>
          <li>✅ AI-powered job recommendations</li>
          <li>✅ Verified employers and agencies</li>
          <li>✅ Easy and fast application process</li>
          <li>✅ 24/7 customer support</li>
        </ul>
      </div>

      {/* Latest Job Openings */}
      <div className="recent-jobs">
        <h2>Latest Job Openings</h2>
        <div className="job-list">
          {jobs.map((job) => (
            <div key={job.job_id} className="job-card">
              <h3>{job.job_title}</h3>
              <p>{job.job_description}</p>
              <button onClick={() => navigate(`/apply-job/${job.job_id}`)}>Apply Now</button>
            </div>
          ))}
        </div>
        <button className="view-more-btn btn-view-more" onClick={() => navigate("/jobs")}>View More Jobs</button>
      </div>

      {/* Call To Action */}
      <div className="cta-section">
        <h2>Ready to Find Your Dream Job?</h2>
        <button className="cta-button" onClick={() => navigate("/recommendations")}>
          Get Recommendation
        </button>
      </div>

    </div>
  );
};

export default Home;
