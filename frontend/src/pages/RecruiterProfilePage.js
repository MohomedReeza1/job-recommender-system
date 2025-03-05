import React, { useEffect, useState } from "react";
import { fetchRecruiterProfile, createRecruiterProfile, updateRecruiterProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";

const RecruiterProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    agency_name: "",
    agency_location: "",
    license_number: "",
    contact_email: "",
  });

  useEffect(() => {
    if (!user || user.role !== "recruiter") {
      navigate("/employer-login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log("Fetching recruiter profile...");
        const response = await fetchRecruiterProfile();
        console.log("Profile response:", response);
        
        if (response) {
          setProfile(response);
          setFormData({
            agency_name: response.agency_name || "",
            agency_location: response.agency_location || "",
            license_number: response.license_number || "",
            contact_email: response.contact_email || ""
          });
        }
      } catch (error) {
        console.error("Error fetching recruiter profile:", error);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleEdit = () => setIsEditing(true);
  
  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to current profile values
    if (profile) {
      setFormData({
        agency_name: profile.agency_name || "",
        agency_location: profile.agency_location || "",
        license_number: profile.license_number || "",
        contact_email: profile.contact_email || ""
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const specific_id = localStorage.getItem("specific_id");
      const user_id = localStorage.getItem("user_id");
      
      // Prepare the data payload
      const payload = { 
        ...formData, 
        user_id: parseInt(user_id) 
      };

      let updatedProfile;
      
      if (profile && specific_id && specific_id !== "pending") {
        // Update existing profile
        updatedProfile = await updateRecruiterProfile(specific_id, payload);
        alert("Profile updated successfully.");
      } else {
        // Create new profile
        updatedProfile = await createRecruiterProfile(payload);
        
        // Update specific_id in localStorage if needed
        if (updatedProfile && updatedProfile.agency_id) {
          localStorage.setItem("specific_id", updatedProfile.agency_id.toString());
        }
        
        alert("Profile created successfully.");
      }
      
      setIsEditing(false);
      setProfile(updatedProfile);
      
      // Update profile in context if needed
      if (updateProfile) {
        updateProfile(updatedProfile);
      }
    } catch (err) {
      console.error("Error updating recruiter profile:", err);
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-container">Loading profile...</div>;
  }

  if (error && !profile) {
    return (
      <div className="profile-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Recruiter Profile</h2>
      <div className="profile-card">
        <div className="profile-field">
          <strong>Agency Name:</strong>
          {isEditing ? (
            <input 
              type="text" 
              name="agency_name" 
              value={formData.agency_name} 
              onChange={handleChange}
              placeholder="Enter agency name" 
            />
          ) : (
            <span>{formData.agency_name || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Agency Location:</strong>
          {isEditing ? (
            <input 
              type="text" 
              name="agency_location" 
              value={formData.agency_location} 
              onChange={handleChange}
              placeholder="Enter agency location" 
            />
          ) : (
            <span>{formData.agency_location || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>License Number:</strong>
          {isEditing ? (
            <input 
              type="text" 
              name="license_number" 
              value={formData.license_number} 
              onChange={handleChange}
              placeholder="Enter license number" 
            />
          ) : (
            <span>{formData.license_number || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Contact Email:</strong>
          {isEditing ? (
            <input 
              type="email" 
              name="contact_email" 
              value={formData.contact_email} 
              onChange={handleChange}
              placeholder="Enter contact email" 
            />
          ) : (
            <span>{formData.contact_email || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-buttons">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="save-btn">Save</button>
              <button onClick={handleCancel} className="cancel-btn">Cancel</button>
            </>
          ) : (
            <button onClick={handleEdit} className="edit-btn">Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfilePage;