// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import axios from "axios"; 
// import '../styles/ApplyJobPage.css';

// const ApplyJobPage = () => {
//   const { jobId } = useParams();
//   const navigate = useNavigate();
//   const [jobDetails, setJobDetails] = useState(null);
//   const [cvFile, setCvFile] = useState(null);
//   const [coverLetterFile, setCoverLetterFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Fetch job details when component mounts
//     const fetchJobDetails = async () => {
//       try {
//         const response = await axios.get(`http://127.0.0.1:8000/api/jobs/${jobId}`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`
//           }
//         });
//         setJobDetails(response.data);
//       } catch (err) {
//         setError("Failed to load job details. Please try again later.");
//       }
//     };

//     fetchJobDetails();
//   }, [jobId]);

//   // Handle file selection for CV
//   const handleCvChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       setCvFile(e.target.files[0]);
//     }
//   };

//   // Handle file selection for Cover Letter
//   const handleCoverLetterChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       setCoverLetterFile(e.target.files[0]);
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!cvFile) {
//       alert("Please upload your CV before applying.");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       // Get token and decode user info
//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error("You must be logged in to apply for jobs");
//       }
      
//       const decoded = jwtDecode(token);
//       const userId = decoded.user_id;
      
//       // Create a FormData object
//       const formData = new FormData();
//       formData.append("user_id", userId);
//       formData.append("job_id", jobId);
//       formData.append("cv", cvFile);
      
//       if (coverLetterFile) {
//         formData.append("cover_letter", coverLetterFile);
//       }
      
//       // Make the API request
//       await axios.post(
//         "http://127.0.0.1:8000/api/apply-job/", 
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );
      
//       alert("Application submitted successfully!");
//       navigate("/applied-jobs");
      
//     } catch (err) {
//       const errorMessage = err.response?.data?.detail || 
//                           err.message || 
//                           "Failed to submit application. Please try again.";
      
//       setError(errorMessage);
//       alert(`Error: ${errorMessage}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (error) {
//     return (
//       <div className="apply-job-page error">
//         <h2>Error</h2>
//         <p>{error}</p>
//         <button onClick={() => navigate("/jobs")}>Back to Jobs</button>
//       </div>
//     );
//   }

//   if (!jobDetails) {
//     return <div className="apply-job-page loading">Loading job details...</div>;
//   }

//   return (
//     <div className="apply-job-page">
//       <h2>{jobDetails.job_title}</h2>
      
//       <div className="job-details">
//         <p><strong>Description:</strong> {jobDetails.job_description}</p>
//         <p><strong>Country:</strong> {jobDetails.country}</p>
//         <p><strong>Skills Required:</strong> {jobDetails.skills_required}</p>
//         {jobDetails.salary && <p><strong>Salary:</strong> {jobDetails.salary}</p>}
//         {jobDetails.working_hours && <p><strong>Working Hours:</strong> {jobDetails.working_hours}</p>}
//         {jobDetails.facilities && <p><strong>Facilities:</strong> {jobDetails.facilities}</p>}
//       </div>

//       <form onSubmit={handleSubmit}>
//         <div className="file-upload">
//           <label htmlFor="cv-upload">Upload CV (Required):</label>
//           <input 
//             id="cv-upload"
//             type="file" 
//             accept=".pdf,.docx,.doc" 
//             onChange={handleCvChange}
//             required
//           />
//           {cvFile && <p className="file-name">Selected: {cvFile.name}</p>}
//         </div>

//         <div className="file-upload">
//           <label htmlFor="cover-letter-upload">Upload Cover Letter (Optional):</label>
//           <input 
//             id="cover-letter-upload"
//             type="file" 
//             accept=".pdf,.docx,.doc" 
//             onChange={handleCoverLetterChange}
//           />
//           {coverLetterFile && <p className="file-name">Selected: {coverLetterFile.name}</p>}
//         </div>

//         <button 
//           type="submit" 
//           disabled={loading}
//           className={loading ? "loading" : ""}
//         >
//           {loading ? "Submitting..." : "Apply Now"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ApplyJobPage;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobDetails, applyForJob } from "../services/api";
import { useAuth } from "../context/AuthContext";
import '../styles/ApplyJobPage.css';

const ApplyJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobDetails, setJobDetails] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in and is a job seeker
    if (!user || user.role !== "job_seeker") {
      alert("You must be logged in as a job seeker to apply for jobs.");
      navigate("/login");
      return;
    }

    // Fetch job details when component mounts
    const fetchJobData = async () => {
      try {
        const response = await fetchJobDetails(jobId);
        setJobDetails(response);
      } catch (err) {
        setError("Failed to load job details. Please try again later.");
      }
    };

    fetchJobData();
  }, [jobId, navigate, user]);

  // Handle file selection for CV
  const handleCvChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  // Handle file selection for Cover Letter
  const handleCoverLetterChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverLetterFile(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cvFile) {
      alert("Please upload your CV before applying.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("You must be logged in to apply for jobs");
      }
      
      // Make the API request
      await applyForJob(jobId, cvFile, coverLetterFile);
      
      alert("Application submitted successfully!");
      navigate("/applied-jobs");
      
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          "Failed to submit application. Please try again.";
      
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="apply-job-page error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/jobs")}>Back to Jobs</button>
      </div>
    );
  }

  if (!jobDetails) {
    return <div className="apply-job-page loading">Loading job details...</div>;
  }

  return (
    <div className="apply-job-page">
      <h2>{jobDetails.job_title}</h2>
      
      <div className="job-details">
        <p><strong>Description:</strong> {jobDetails.job_description}</p>
        <p><strong>Country:</strong> {jobDetails.country}</p>
        <p><strong>Skills Required:</strong> {jobDetails.skills_required}</p>
        {jobDetails.salary && <p><strong>Salary:</strong> {jobDetails.salary}</p>}
        {jobDetails.working_hours && <p><strong>Working Hours:</strong> {jobDetails.working_hours}</p>}
        {jobDetails.facilities && <p><strong>Facilities:</strong> {jobDetails.facilities}</p>}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="file-upload">
          <label htmlFor="cv-upload">Upload CV (Required):</label>
          <input 
            id="cv-upload"
            type="file" 
            accept=".pdf,.docx,.doc" 
            onChange={handleCvChange}
            required
          />
          {cvFile && <p className="file-name">Selected: {cvFile.name}</p>}
        </div>

        <div className="file-upload">
          <label htmlFor="cover-letter-upload">Upload Cover Letter (Optional):</label>
          <input 
            id="cover-letter-upload"
            type="file" 
            accept=".pdf,.docx,.doc" 
            onChange={handleCoverLetterChange}
          />
          {coverLetterFile && <p className="file-name">Selected: {coverLetterFile.name}</p>}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={loading ? "loading" : ""}
        >
          {loading ? "Submitting..." : "Apply Now"}
        </button>
      </form>
    </div>
  );
};

export default ApplyJobPage;