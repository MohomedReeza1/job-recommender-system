import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginEmployer } from "../services/api";
import "../styles/EmployerLogin.css";

const EmployerLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
      const response = await loginEmployer(formData.email, formData.password);

      const userData = {
        email: formData.email,
        role: response.role,
        user_id: response.user_id,
        token: response.access_token
      };

      if (userData.role !== "recruiter") {
        alert("You are trying to log in as an employer with a job seeker account.");
        return;
      }

      login(userData);
      alert("Login successful!");
      navigate("/my-posted-jobs");
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.detail || "Invalid email or password.");
    }
  };

  return (
    <div className="login-container">
      <h2>Employer Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Work Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/employer-signup">Sign up here</a></p>
    </div>
  );
};

export default EmployerLogin;
