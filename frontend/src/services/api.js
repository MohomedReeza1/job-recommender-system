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

export const fetchRecommendations = async (userId) => {
  try {
    const response = await api.get(`/recommendations/${userId}`);
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

export const fetchAppliedJobs = async (userId) => {
  if (!userId) {
    console.error("fetchAppliedJobs: No user ID provided");
    return [];
  }
  
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("fetchAppliedJobs: No auth token found");
      throw new Error("Authentication required");
    }
    
    console.log(`Sending request to fetch applied jobs for user ID: ${userId}`);
    const response = await api.get(`/applied-jobs/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching applied jobs:", error.response?.data || error.message);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
};

export const loginJobSeeker = async (email, password) => {
  try {
    const response = await api.post("/auth/login", new URLSearchParams({ 
      username: email, password, scope: "job_seeker" }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
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
export const fetchJobSeekerProfile = async (userId) => {
  const token = localStorage.getItem("token");
  if (!token) {
      console.error("fetchJobSeekerProfile: No auth token found!");
      throw new Error("Unauthorized: No token available.");
  }

  try {
      const response = await api.get(`/seekers/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
  } catch (error) {
      console.error("Error fetching job seeker profile:", error.response?.data || error.message);
      throw error;
  }
};


export const createJobSeekerProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  const response = await api.post("/seekers/", profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};


export const updateJobSeekerProfile = async (userId, profileData) => {
  const token = localStorage.getItem("token");
  const response = await api.put(`/seekers/${userId}`, profileData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  return response.data;
};

// Fetch Recruiter Profile
export const fetchRecruiterProfile = async (userId) => {
  const token = localStorage.getItem("token");
  return api.get(`/recruiters/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

export const createRecruiterProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  return api.post("/recruiters/", JSON.stringify(profileData), {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  }).then(res => res.data);
};

export const updateRecruiterProfile = async (userId, profileData) => {
  const token = localStorage.getItem("token");
  return api.put(`/recruiters/${userId}`, profileData, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  }).then(res => res.data);
};

// Fetch Job details to Recruiter Profile
export const fetchMyPostedJobs = async (userId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required");
  }
  try {
    const response = await api.get(`/recruiters/${userId}/my-posted-jobs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching posted jobs:", error.response?.data || error.message);
    throw error;
  }
};

export const postJob = async (jobData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required");
  }
  try {
    const response = await api.post("/post-job/", jobData, {
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

