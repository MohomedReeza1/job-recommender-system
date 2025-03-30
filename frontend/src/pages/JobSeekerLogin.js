import React, { useState } from "react";
import { loginJobSeeker } from "../services/api";
import "../styles/JobSeekerLogin.css";
import { useAuth } from "../context/AuthContext"; 

const JobSeekerLogin = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
        // Use the API function to log in as a Job Seeker
        const response = await loginJobSeeker(formData.email, formData.password);

        // Extract user details
        const userData = {
            email: formData.email,
            role: response.role,
            user_id: response.user_id,
            token: response.access_token,
            specific_id: response.specific_id
        };

        if (userData.role !== "job_seeker") {
            setError("You are trying to log in as a job seeker with an employer account.");
            setLoading(false);
            return;
        }

        // Store user data in AuthContext and localStorage
        login(userData);

        // Don't navigate here - let the AuthContext handle it
    } catch (error) {
        console.error("Login error:", error);
        setError(error.response?.data?.detail || "Invalid email or password.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Job Seeker Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p>Don't have an account? <a href="/signup">Sign up here</a></p>
    </div>
  );
};

export default JobSeekerLogin;