import React from "react";
import logo from "../assets/logo.png";

const Home = () => {
  return (
    <div>
      
      <h2>Welcome to the Job Recommendation App!</h2>
      <p>Find jobs that suit you the best, based on your profile and preferences.</p>
      <img src={logo} alt="Job Recommender Logo" />
    </div>
  );
};

export default Home;
