import React, { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
      const response = await api.post("/auth/login", new URLSearchParams({
        username: formData.email,
        password: formData.password,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
      const userData = {
        email: formData.email,
        role: "recruiter",
        token: response.data.access_token
      };

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
