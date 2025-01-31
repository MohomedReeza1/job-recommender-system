import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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