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
    // First, make the login request
    const response = await api.post("/auth/login", new URLSearchParams({
      username: email, 
      password, 
      scope: "recruiter" 
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    
    // Debug the raw response
    console.log("Raw login response data:", JSON.stringify(response.data));
    
    // Extract the specific_id from the response and ensure it's properly typed
    const specificId = response.data.specific_id !== undefined ? response.data.specific_id : null;
    
    // Create a clean response object with properly typed values
    const cleanResponse = {
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      role: response.data.role,
      user_id: Number(response.data.user_id),
      specific_id: specificId !== null ? Number(specificId) : null,
      email: email // Add email for reference
    };
    
    console.log("Found existing agency profile with ID:", cleanResponse.specific_id);
    console.log("Login response data:", cleanResponse);
    
    return cleanResponse;
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
  const user_id = localStorage.getItem("user_id");
  const email = localStorage.getItem("email");
  
  if (!token) {
      throw new Error("Authentication required");
  }
  
  console.log("fetchRecruiterProfile - specific_id:", specific_id);
  
  // Parse the specific_id to ensure it's handled correctly
  let parsedId = null;
  if (specific_id && specific_id !== "pending" && specific_id !== "undefined" && specific_id !== "null") {
      parsedId = Number(specific_id);
      if (isNaN(parsedId)) {
          parsedId = null;
      }
  }
  
  // If we have a valid parsed ID, use it to fetch the profile
  if (parsedId !== null) {
      try {
          console.log(`Fetching recruiter profile with ID: ${parsedId}`);
          const response = await api.get(`/recruiters/${parsedId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          console.log("Profile fetched successfully:", response.data);
          return response.data;
      } catch (error) {
          console.error(`Error fetching profile with ID ${parsedId}:`, error);
          // Continue to try creating a profile if fetch fails
      }
  }
  
  // If we get here, we either don't have a specific_id or there was an error fetching
  console.log("Creating new recruiter profile...");
  
  // Try to extract the email from login data if available
  const contactEmail = email || `user${user_id}@example.com`;
  
  // Attempt to create a profile using the user_id
  try {
      if (user_id) {
          // Create a complete profile with ALL required fields
          const profileData = { 
              user_id: parseInt(user_id),
              agency_name: email ? email.split('@')[0] : "Your Agency", // Use email username as agency name
              agency_location: "Not Specified", 
              license_number: `TMP-${user_id}`,
              contact_email: contactEmail // Use logged-in email or fallback
          };
          
          console.log("Creating new recruiter profile with data:", profileData);
          
          const response = await api.post("/recruiters/", profileData, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log("Profile creation response:", response.data);
          
          // Get the specific_id from the response and store it
          if (response.data && response.data.agency_id) {
              localStorage.setItem("specific_id", String(response.data.agency_id));
              console.log("Created new recruiter profile and got specific_id:", response.data.agency_id);
              
              // Return the newly created profile
              return response.data;
          }
      }
  } catch (profileError) {
      console.error("Failed to create profile:", profileError.response?.data || profileError.message);
      // Continue with empty profile despite error
  }
  
  // Return a default empty profile
  return {
      agency_name: "",
      agency_location: "",
      license_number: "",
      contact_email: ""
  };
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
// Function to fetch posted jobs by recruiter
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
      // Check for specific error type
      if (error.response?.data?.detail) {
          console.error("Server error detail:", error.response.data.detail);
      }
      // Return empty array instead of throwing to prevent UI crashes
      return [];
  }
};


export const postJob = async (jobData) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Authentication required");
  }
  
  try {
    // We don't need to set the recruiter_id/agency_id here
    // The backend will handle setting the correct agency_id based on the authenticated user
    
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