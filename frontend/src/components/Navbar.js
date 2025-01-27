import React from "react";
import { Link } from "react-router-dom";
import '../styles/Navbar.css';


const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>Job Recommender</h1>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/jobs">Jobs</Link>
        </li>
        <li>
          <Link to="/recommendations">Recommendations</Link>
        </li>
        <li>
          <Link to="/applied-jobs">Applied Jobs</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
