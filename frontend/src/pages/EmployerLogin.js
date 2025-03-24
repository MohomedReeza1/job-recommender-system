import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginEmployer } from "../services/api";
import "../styles/EmployerLogin.css";

const EmployerLogin = () => {
  const { login } = useAuth();
  // const navigate = useNavigate();
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
      // Call the API to log in as an employer
      const response = await loginEmployer(formData.email, formData.password);
      
      // Ensure we have a valid response
      if (!response || !response.access_token) {
        throw new Error("Invalid response from server");
      }
      
      // Check if the user has the correct role
      if (response.role !== "recruiter") {
        setError("You are trying to log in as an employer with a job seeker account.");
        setLoading(false);
        return;
      }
      
      // Create a properly formatted user data object for the login context
      const userData = {
        token: response.access_token,  // Make sure token is mapped correctly
        role: response.role,
        user_id: response.user_id,
        specific_id: response.specific_id
      };
      
      console.log("Formatted login data being passed to AuthContext:", userData);
      
      // Log the user in (this will handle storing the token and redirecting)
      await login(userData);
      
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Employer Login</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Work Email"
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
      <p>Don't have an account? <a href="/employer-signup">Sign up here</a></p>
    </div>
  );
};

export default EmployerLogin;