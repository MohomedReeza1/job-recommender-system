import React, { useEffect, useState, useCallback } from "react";
import { updateJobSeekerProfile, fetchJobSeekerProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/ProfilePage.css";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    marital_status: "",
    num_of_children: "",
    education: "",
    skills: "",
    interests: "",
    previous_jobs: "",
    looking_jobs: "",
    description: "",
    passport_status: "",
  });
  // Store the original form data before editing for cancel functionality
  const [originalFormData, setOriginalFormData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Use useCallback to prevent the function from being recreated on every render
  const loadProfileData = useCallback(async () => {
    // Skip if already loaded or loading
    if (profileLoaded || loadingProfile) return;
    
    try {
      setLoadingProfile(true);
      setError(null);
      
      // If userProfile from context is available, use it
      if (userProfile) {
        setFormData(userProfile);
        setProfileLoaded(true);
      } else {
        // Otherwise fetch it directly
        const profile = await fetchJobSeekerProfile();
        if (profile) {
          setFormData(profile);
          updateProfile(profile);
          setProfileLoaded(true);
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoadingProfile(false);
    }
  }, [userProfile, updateProfile, profileLoaded, loadingProfile]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Only load profile if not already loaded
    if (!profileLoaded && !loadingProfile) {
      loadProfileData();
    }
    
  }, [user, navigate, loadProfileData, profileLoaded, loadingProfile]);

  const handleEdit = () => {
    // Save the current form data as original before editing
    setOriginalFormData({...formData});
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to the original data saved before editing
    if (originalFormData) {
      setFormData(originalFormData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoadingProfile(true);
      const response = await updateJobSeekerProfile(formData);
      updateProfile(response); // Update the profile in context
      setIsEditing(false);
      // Update the original form data after successful save
      setOriginalFormData({...response});
      alert("Profile updated successfully.");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoadingProfile(false);
    }
  };

  if (loadingProfile) {
    return <div className="profile-container">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="profile-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => { 
          setProfileLoaded(false); 
          loadProfileData(); 
        }}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Job Seeker Profile</h2>
      <div className="profile-card">
        <div className="profile-field">
          <strong>Name:</strong>
          {isEditing ? (
            <input type="text" name="name" value={formData.name || ""} onChange={handleChange} />
          ) : (
            <span>{formData.name || "Not Specified"}</span>
          )}
        </div>

        <div className="profile-field">
          <strong>Age:</strong>
          {isEditing ? (
            <input type="number" name="age" value={formData.age || ""} onChange={handleChange} />
          ) : (
            <span>{formData.age || "Not Specified"}</span>
          )}
        </div>

        <div className="profile-field">
          <strong>Gender:</strong>
          {isEditing ? (
            <select name="gender" value={formData.gender || ""} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <span>{formData.gender || "Not Specified"}</span>
          )}
        </div>

        <div className="profile-field">
          <strong>Height:</strong>
          {isEditing ? (
            <input type="number" name="height" value={formData.height || ""} onChange={handleChange} />
          ) : (
            <span>{formData.height ? `${formData.height} cm` : "Not Specified"}</span>
          )}
        </div>

        <div className="profile-field">
          <strong>Weight:</strong>
          {isEditing ? (
            <input type="number" name="weight" value={formData.weight || ""} onChange={handleChange} />
          ) : (
            <span>{formData.weight ? `${formData.weight} kg` : "Not Specified"}</span>
          )}
        </div>

        <div className="profile-field">
          <strong>Marital Status:</strong>
          {isEditing ? (
            <select name="marital_status" value={formData.marital_status || ""} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
          ) : (
            <span>{formData.marital_status || "Not Specified"}</span>
          )}
        </div>

        <div className="profile-field">
          <strong>Number of Children:</strong>
          {isEditing ? (
            <input type="number" name="num_of_children" value={formData.num_of_children || ""} onChange={handleChange} />
          ) : (
            <span>{formData.num_of_children !== null ? formData.num_of_children : "Not Specified"}</span>
          )}
        </div>

        <div className="profile-field">
          <strong>Education:</strong>
          {isEditing ? (
            <select name="education" value={formData.education || ""} onChange={handleChange}>
              <option value="">Select</option>
              <option value="High School">High School</option>
              <option value="Diploma">Diploma</option>
              <option value="Degree">Degree</option>
            </select>
          ) : (
            <span>{formData.education || "Not Specified"}</span>
          )}
        </div>

        <div className="profile-field">
          <strong>Skills:</strong>
          {isEditing ? (
            <input type="text" name="skills" value={formData.skills || ""} onChange={handleChange} />
          ) : (
            <span>{formData.skills || "Not Specified"}</span>
          )}
        </div>

        <div className="profile-field">
          <strong>Interests:</strong>
          {isEditing ? (
            <input type="text" name="interests" value={formData.interests || ""} onChange={handleChange} />
          ) : (
            <span>{formData.interests || "Not Specified"}</span>
          )}
        </div>

        <div className="profile-field">
          <strong>Previous Jobs:</strong>
          {isEditing ? (
            <input type="text" name="previous_jobs" value={formData.previous_jobs || ""} onChange={handleChange} />
          ) : (
            <span>{formData.previous_jobs || "Not Specified"}</span>
          )}
        </div>
        
        <div className="profile-field">
          <strong>Looking Jobs:</strong>
          {isEditing ? (
            <input type="text" name="looking_jobs" value={formData.looking_jobs || ""} onChange={handleChange} />
          ) : (
            <span>{formData.looking_jobs || "Not Specified"}</span>
          )}
        </div>
        
        <div className="profile-field">
          <strong>Description:</strong>
          {isEditing ? (
            <textarea name="description" value={formData.description || ""} onChange={handleChange} />
          ) : (
            <span>{formData.description || "Not Specified"}</span>
          )}
        </div>

        <div className="profile-field">
          <strong>Passport status:</strong>
          {isEditing ? (
            <select name="passport_status" value={formData.passport_status || ""} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Valid">Valid</option>
              <option value="Invalid">Invalid</option>
              <option value="Applied">Applied</option>
            </select>
          ) : (
            <span>{formData.passport_status || "Not Specified"}</span>
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

export default ProfilePage;