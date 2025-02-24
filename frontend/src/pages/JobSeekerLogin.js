import React, { useState } from "react";
// import { api } from "../services/api";
import { loginJobSeeker } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/JobSeekerLogin.css";
import { useAuth } from "../context/AuthContext"; 

const JobSeekerLogin = () => {
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const response = await api.post("/auth/login", new URLSearchParams({
  //       username: formData.email,
  //       password: formData.password,
  //     }),
  //     {
  //       headers: {
  //         "Content-Type": "application/x-www-form-urlencoded"
  //       }
  //     }

  //   );
  //     const userData = {
  //       email: formData.email,
  //       role: response.data.role,
  //       user_id: response.data.user_id,
  //       token: response.data.access_token
  //     };

  //     if (userData.role !== "job_seeker") {
  //       alert("You are trying to log in as a job seeker with an employer account.");
  //       return;
  //     }

  //     login(userData);

  //     alert("Login successful!");
  //     navigate("/jobs");
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     alert(error.response?.data?.detail || "Invalid email or password.");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Use the API function instead of direct API call
        const response = await loginJobSeeker(formData.email, formData.password);

        // Extract user details
        const userData = {
            email: formData.email,
            role: response.role,
            user_id: response.user_id,
            token: response.access_token
        };

        if (userData.role !== "job_seeker") {
            alert("You are trying to log in as a job seeker with an employer account.");
            return;
        }

        // Store user data in AuthContext and localStorage
        login(userData);

        // Debugging check
        console.log("Login successful:", userData);
        alert("Login successful!");

        navigate("/jobs");
    } catch (error) {
        console.error("Login error:", error);
        alert(error.response?.data?.detail || "Invalid email or password.");
    }
  };


  return (
    <div className="login-container">
      <h2>Job Seeker Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
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
      <p>Don't have an account? <a href="/signup">Sign up here</a></p>
    </div>
  );
};

export default JobSeekerLogin;
