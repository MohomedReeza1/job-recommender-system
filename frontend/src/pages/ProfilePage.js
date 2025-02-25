import React, { useEffect, useState } from "react";
import { fetchJobSeekerProfile, updateJobSeekerProfile, createJobSeekerProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/ProfilePage.css";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: 0,
    gender: "",
    height: 0,
    weight: 0,
    marital_status: "",
    num_of_children: 0,
    education: "",
    skills: "",
    interests: "",
    previous_jobs: "",
    looking_jobs: "",
    description: "",
    passport_status: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

  const fetchProfile = async () => {
    try {
      const response = await fetchJobSeekerProfile(user.user_id);
      setProfile(response);
      setFormData(response);
    } catch (error) {
      console.error("Error fetching profile data:", error);
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
        await updateJobSeekerProfile(user.user_id, payload);
        alert("Profile updated successfully.");
      } else {
        await createJobSeekerProfile(payload);
        alert("Profile created successfully.");
      }
  
      setIsEditing(false);
      setProfile(payload);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };
  

  return (
    <div className="profile-container">
      <h2>Job Seeker Profile</h2>
      <div className="profile-card">
        <div className="profile-field">
          <strong>Name:</strong>
          {isEditing ? (
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
          ) : (
            <span>{profile?.name || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Age:</strong>
          {isEditing ? (
            <input type="number" name="age" value={formData.age} onChange={handleChange} />
          ) : (
            <span>{profile?.age || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Gender:</strong>
          {isEditing ? (
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <span>{profile?.gender || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Height:</strong>
          {isEditing ? (
            <input type="number" name="height" value={formData.height} onChange={handleChange} />
          ) : (
            <span>{profile?.height || "Not Specified"} cm</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Weight:</strong>
          {isEditing ? (
            <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
          ) : (
            <span>{profile?.weight || "Not Specified"} kg</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Marital Status:</strong>
          {isEditing ? (
            <select name="marital_status" value={formData.marital_status} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
          ) : (
            <span>{profile?.marital_status || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Number of Children:</strong>
          {isEditing ? (
            <input type="number" name="num_of_children" value={formData.num_of_children} onChange={handleChange} />
          ) : (
            <span>{profile?.num_of_children || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Education:</strong>
          {isEditing ? (
            <select name="education" value={formData.education} onChange={handleChange}>
              <option value="">Select</option>
              <option value="HighSchool">High School</option>
              <option value="Diploma">Diploma</option>
              <option value="Degree">Degree</option>
            </select>
          ) : (
            <span>{profile?.education || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Skills:</strong>
          {isEditing ? (
            <input type="text" name="skills" value={formData.skills} onChange={handleChange} />
          ) : (
            <span>{profile?.skills || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Interests:</strong>
          {isEditing ? (
            <input type="text" name="interests" value={formData.interests} onChange={handleChange} />
          ) : (
            <span>{profile?.interests || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Previous Jobs:</strong>
          {isEditing ? (
            <input type="text" name="previous_jobs" value={formData.previous_jobs} onChange={handleChange} />
          ) : (
            <span>{profile?.previous_jobs || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Looking Jobs:</strong>
          {isEditing ? (
            <input type="text" name="looking_jobs" value={formData.looking_jobs} onChange={handleChange} />
          ) : (
            <span>{profile?.looking_jobs || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Description:</strong>
          {isEditing ? (
            <input type="textarea" name="description" value={formData.description} onChange={handleChange} />
          ) : (
            <span>{profile?.description || "Not Specified"}</span>
          )}
        </div>
        <div className="profile-field">
          <strong>Passport status:</strong>
          {isEditing ? (
            <select name="passport_status" value={formData.passport_status} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Valid">Valid</option>
              <option value="Invalid">Invalid</option>
              <option value="Applied">Applied</option>
            </select>
          ) : (
            <span>{profile?.passport_status || "Not Specified"}</span>
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
  