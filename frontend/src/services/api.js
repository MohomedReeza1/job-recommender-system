import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchJobs = async () => {
  try {
    const response = await api.get("/jobs/");
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

export const fetchRecommendations = async () => {
  const specific_id = localStorage.getItem("specific_id");
  
  if (!specific_id) {
    console.error("fetchRecommendations: No specific ID found");
    throw new Error("User profile information missing");
  }
  
  try {
    const response = await api.get(`/recommendations/${specific_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
};

export const fetchRecommendationsWithForm = async (formData) => {
  try {
    const response = await api.post("/recommendations/", formData);
    return response.data;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
};

export const fetchAppliedJobs = async () => {
  const token = localStorage.getItem("token");
  const specific_id = localStorage.getItem("specific_id");
  
  if (!token) {
      console.error("fetchAppliedJobs: No auth token found");
      return [];
  }
  
  if (!specific_id || specific_id === "pending" || specific_id === "undefined" || specific_id === "null") {
      console.error("fetchAppliedJobs: No specific ID found");
      return [];
  }
  
  try {
      const response = await api.get(`/applied-jobs/${specific_id}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
  } catch (error) {
      console.error("Error fetching applied jobs:", error);
      return [];
  }
};

export const loginJobSeeker = async (email, password) => {
  try {
    const response = await api.post("/auth/login", new URLSearchParams({ 
      username: email, 
      password, 
      scope: "job_seeker" 
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    
    console.log("Login response:", response.data);
    
    // Ensure specific_id is present
    if (response.data.specific_id === undefined || response.data.specific_id === null) {
      console.warn("No specific_id in login API response, setting a placeholder value");
      response.data.specific_id = "pending";
    }
    
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};
export const loginEmployer = async (email, password) => {
  try {
    const response = await api.post("/auth/login", new URLSearchParams({
      username: email, password, scope: "recruiter" }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Fetch Job Seeker Profile
export const fetchJobSeekerProfile = async () => {
  const token = localStorage.getItem("token");
  const specific_id = localStorage.getItem("specific_id");
  const user_id = localStorage.getItem("user_id");
  
  if (!token) {
      throw new Error("Authentication required");
  }
  
  if (!specific_id || specific_id === "pending" || specific_id === "undefined" || specific_id === "null") {
      console.error("Missing specific_id for job seeker profile fetch");
      
      // Attempt to get specific_id by requesting a new empty profile creation
      try {
          // Try to create a profile using the user_id
          if (user_id) {
              const response = await api.post("/seekers/", 
                  { user_id: parseInt(user_id) },
                  { headers: { Authorization: `Bearer ${token}` }}
              );
              
              // Get the specific_id from the response and store it
              if (response.data && response.data.seeker_id) {
                  localStorage.setItem("specific_id", String(response.data.seeker_id));
                  console.log("Created new profile and got specific_id:", response.data.seeker_id);
                  
                  // Return the newly created profile
                  return response.data;
              }
          }
      } catch (profileError) {
          console.error("Failed to create profile:", profileError);
      }
      
      // Return a default empty profile
      return {
          name: "",
          age: null,
          gender: "",
          height: null,
          weight: null,
          marital_status: "",
          num_of_children: null,
          education: "",
          skills: "",
          interests: "",
          previous_jobs: "",
          looking_jobs: "",
          description: "",
          passport_status: ""
      };
  }
  
  try {
      const response = await api.get(`/seekers/${specific_id}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
  } catch (error) {
      console.error("Error fetching profile:", error);
      // Return empty profile on error
      return {
          name: "",
          age: null,
          gender: "",
          height: null,
          weight: null,
          marital_status: "",
          num_of_children: null,
          education: "",
          skills: "",
          interests: "",
          previous_jobs: "",
          looking_jobs: "",
          description: "",
          passport_status: ""
      };
  }
};



export const createJobSeekerProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("user_id");
  
  if (!token || !user_id) {
    throw new Error("Authentication required");
  }
  
  // Add user_id to the profile data
  const completeProfileData = {
    ...profileData,
    user_id: parseInt(user_id)
  };
  
  try {
    const response = await api.post("/seekers/", completeProfileData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  }
};

export const updateJobSeekerProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  const specific_id = localStorage.getItem("specific_id");
  
  if (!token || !specific_id) {
      throw new Error("Authentication required");
  }
  
  try {
      const response = await api.put(`/seekers/${specific_id}`, profileData, {
          headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
  } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
  }
};

// Function to handle applying for a job
export const applyForJob = async (jobId, cvFile, coverLetterFile) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Authentication required");
  }
  
  // Create form data
  const formData = new FormData();
  formData.append("job_id", jobId);
  formData.append("cv", cvFile);
  
  if (coverLetterFile) {
    formData.append("cover_letter", coverLetterFile);
  }
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/apply-job/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error applying for job:", error);
    throw error;
  }
};


// Fetch Recruiter Profile
export const fetchRecruiterProfile = async () => {
  const token = localStorage.getItem("token");
  const specific_id = localStorage.getItem("specific_id");
  
  if (!token || !specific_id) {
      throw new Error("Authentication required");
  }
  
  try {
      const response = await api.get(`/recruiters/${specific_id}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
  } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
  }
};

export const createRecruiterProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("user_id");
  
  if (!token || !user_id) {
    throw new Error("Authentication required");
  }
  
  // Add user_id to the profile data
  const completeProfileData = {
    ...profileData,
    user_id: parseInt(user_id)
  };
  
  try {
    const response = await api.post("/recruiters/", completeProfileData, {
      headers: { 
        Authorization: `Bearer ${token}`, 
        "Content-Type": "application/json" 
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  }
};

export const updateRecruiterProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  const specific_id = localStorage.getItem("specific_id");
  
  if (!token || !specific_id) {
      throw new Error("Authentication required");
  }
  
  try {
      const response = await api.put(`/recruiters/${specific_id}`, profileData, {
          headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
  } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
  }
};

// Fetch Job details to Recruiter Profile
export const fetchMyPostedJobs = async () => {
  const token = localStorage.getItem("token");
  const specific_id = localStorage.getItem("specific_id");
  
  if (!token || !specific_id) {
      throw new Error("Authentication required");
  }
  
  try {
      const response = await api.get(`/recruiters/${specific_id}/my-posted-jobs`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
  } catch (error) {
      console.error("Error fetching posted jobs:", error);
      throw error;
  }
};

export const postJob = async (jobData) => {
  const token = localStorage.getItem("token");
  const specific_id = localStorage.getItem("specific_id");
  
  if (!token || !specific_id) {
    throw new Error("Authentication required");
  }
  
  try {
    // Set the recruiter_id from specific_id (agency_id) for recruiters
    const completeJobData = {
      ...jobData,
      recruiter_id: parseInt(specific_id)
    };
    
    const response = await api.post("/post-job/", completeJobData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error posting job:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteJob = async (jobId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required");
  }
  try {
    const response = await api.delete(`/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting job:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchJobDetails = async (jobId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await api.get(`/jobs/${jobId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching job details:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchJobApplicants = async (jobId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required");
  }
  try {
    const response = await api.get(`/job-applicants/${jobId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching job applicants:", error.response?.data || error.message);
    throw error;
  }
};