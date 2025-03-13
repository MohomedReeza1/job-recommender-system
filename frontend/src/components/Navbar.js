import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <h1><Link to="/" className="globalhire">GlobalHire</Link></h1>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/jobs">Jobs</Link></li>
        <li><Link to="/recommendations">Recommendations</Link></li>
        
        {user ? (
          user.role === "job_seeker" ? (
            <>
              <li><Link to="/applied-jobs">Applied Jobs</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </>
          ) : user.role === "recruiter" ? (
            <>
              <li><Link to="/my-posted-jobs">My Posted Jobs</Link></li>
              <li><Link to="/post-job">Post a Job</Link></li>
              {/* <li><Link to="/view-applicants">View Applicants</Link></li> */}
              <li><Link to="/recruiter-profile">Profile</Link></li>
            </>
          ) : null
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
            <li><Link to="/employer-signup">For Employers</Link></li>
          </>
        )}

        {user && <li><Link to="/"><button onClick={logout}>Logout</button></Link></li>}
      </ul>
    </nav>
  );
};

export default Navbar;
