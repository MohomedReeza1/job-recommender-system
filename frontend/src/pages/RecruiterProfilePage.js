import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRecruiterProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/ProfilePage.css"; // Reusing the existing styling

const RecruiterProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if not logged in as a recruiter
    if (!user || user.role !== "recruiter") {
      navigate("/employer-login");
      return;
    }

    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const profileData = await fetchRecruiterProfile();
        setProfile(profileData);
        
      } catch (err) {
        console.error("Error loading recruiter profile:", err);
        setError("Failed to load agency profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user, navigate]);

  if (loading) {
    return <div className="profile-container">Loading agency profile...</div>;
  }

  if (error) {
    return (
      <div className="profile-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!profile) {
    return <div className="profile-container">No profile information found.</div>;
  }

  return (
    <div className="profile-container">
      <h2>Agency Profile</h2>
      <div className="profile-card">
        <div className="profile-field">
          <strong>Agency Name:</strong>
          <span>{profile.agency_name || "Not Specified"}</span>
        </div>

        <div className="profile-field">
          <strong>Location:</strong>
          <span>{profile.agency_location || "Not Specified"}</span>
        </div>

        <div className="profile-field">
          <strong>License Number:</strong>
          <span>{profile.license_number || "Not Specified"}</span>
        </div>

        <div className="profile-field">
          <strong>Contact Email:</strong>
          <span>{profile.contact_email || "Not Specified"}</span>
        </div>

        <div className="profile-field">
          <strong>Registered On:</strong>
          <span>{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "Not Specified"}</span>
        </div>
        
        {/* Back to Jobs button */}
        <div className="profile-buttons">
          <button onClick={() => navigate("/my-posted-jobs")} className="edit-btn">
            Back to My Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfilePage;