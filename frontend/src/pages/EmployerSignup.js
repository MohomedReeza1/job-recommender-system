import React, { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/EmployerSignup.css";

const EmployerSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    agency_name: "",
    agency_location: "",
    license_number: "",
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
      console.log("Submitting registration with data:", formData);
      
      // Register the user with complete agency details
      await api.post("/auth/register", {
        name: formData.agency_name,
        email: formData.email,
        password: formData.password,
        role: "recruiter",
        // Pass additional agency fields
        agency_location: formData.agency_location,
        license_number: formData.license_number,
      });
      
      alert("Employer account created successfully!");
      navigate("/employer-login");
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.response?.data?.detail || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Employer Signup</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="agency_name"
          placeholder="Company Name"
          value={formData.agency_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="agency_location"
          placeholder="Company Location"
          value={formData.agency_location}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="license_number"
          placeholder="License Number"
          value={formData.license_number}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Company Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Create Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
      <p>Already have an account? <a href="/employer-login">Login here</a></p>
    </div>
  );
};

export default EmployerSignup;