import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Example: Fetch jobs
export const fetchJobs = async () => {
  try {
    const response = await api.get("/jobs/");
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

// Example: Get recommendations
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

export const fetchAppliedJobs = async (seekerId) => {
  try {
    const response = await api.get(`/applied-jobs/${seekerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    throw error;
  }
};

export const loginJobSeeker = async (email, password) => {
  try {
    // const response = await axios.post("/auth/login", new URLSearchParams({ 
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



/////////////

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


export const createJobSeekerProfile = async (userId, profileData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`/seekers/${userId}`, profileData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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

// ✅ Fetch Recruiter Profile
export const fetchRecruiterProfile = async (userId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized: No token available.");

  try {
      const response = await api.get(`/recruiters/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
  } catch (error) {
      console.error("Error fetching recruiter profile:", error.response?.data || error.message);
      throw error;
  }
};

export const createRecruiterProfile = async (userId, profileData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`/recruiters/${userId}`, profileData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  return response.data;
};

export const updateRecruiterProfile = async (userId, profileData) => {
  const token = localStorage.getItem("token");
  const response = await api.put(`/recruiters/${userId}`, profileData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  return response.data;
};
