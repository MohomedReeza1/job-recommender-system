import React, { useEffect, useState } from "react";
import { fetchRecruiterProfile, createRecruiterProfile, updateRecruiterProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";

const RecruiterProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    agency_name: "",
    agency_location: "",
    license_number: "",
    contact_email: "",
  });

  useEffect(() => {
    if (!user || user.role !== "recruiter") {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetchRecruiterProfile(user.user_id);
        setProfile(response);
        setFormData(response);
      } catch (error) {
        console.error("Error fetching recruiter profile:", error);
      }
    };
    fetchProfile();
  }, [user, navigate]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setFormData(profile || {});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
        const payload = { ...formData, user_id: user.user_id };

      if (profile) {
        await updateRecruiterProfile(user.user_id, payload);
        alert("Profile updated successfully.");
      } else {
        await createRecruiterProfile(payload);
        alert("Profile created successfully.");
      }
      setIsEditing(false);
      setProfile(payload);
    } catch (err) {
      console.error("Error updating recruiter profile:", err);
    }
  };

  return (
    <div className="profile-container">
      <h2>Recruiter Profile</h2>
      <div className="profile-card">
        <div className="profile-field">
          <strong>Agency Name:</strong>
          {isEditing ? (
            <input type="text" name="agency_name" value={formData.agency_name} onChange={handleChange} />
          ) : (
            <span>{profile?.agency_name || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Agency Location:</strong>
          {isEditing ? (
            <input type="text" name="agency_location" value={formData.agency_location} onChange={handleChange} />
          ) : (
            <span>{profile?.agency_location || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>License Number:</strong>
          {isEditing ? (
            <input type="text" name="license_number" value={formData.license_number} onChange={handleChange} />
          ) : (
            <span>{profile?.license_number || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Contact Email:</strong>
          {isEditing ? (
            <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} />
          ) : (
            <span>{profile?.contact_email || "Not Specified"}</span>
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
