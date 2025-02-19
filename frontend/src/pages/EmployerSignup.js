import React, { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/EmployerSignup.css";

const EmployerSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    agency_location: "",
    license_number: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "recruiter", 
      });
      alert("Employer account created successfully!");
      navigate("/employer-login");
    } catch (error) {
      console.error("Signup error:", error);
      alert("Failed to create account.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Employer Signup</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
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
          placeholder="Work Email"
          value={formData.contact_email}
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
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <a href="/employer-login">Login here</a></p>
    </div>
  );
};

export default EmployerSignup;
