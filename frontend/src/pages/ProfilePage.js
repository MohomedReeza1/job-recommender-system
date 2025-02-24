import React, { useEffect, useState } from "react";
import { fetchJobSeekerProfile, createJobSeekerProfile, updateJobSeekerProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
      name: "",
      age: "",
      gender: "",
      height: "",
      weight: "",
      marital_status: "",
      num_children: "",
      education: "",
      skills: "",
      interests: "",
      previous_jobs: "",
      looking_jobs: "",
      description: "",
      passport_status: ""
  });

  useEffect(() => {
    if (!user || !user.userId) {
        setError("User not found. Please log in.");
        setLoading(false);
        return;
    }

    const loadProfile = async () => {
        try {
            const response = await fetchJobSeekerProfile(user.userId);
            if (response) {
                setProfile(response);
                setFormData(response);
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError("Profile not found. You may need to create one.");
        } finally {
            setLoading(false);
        }
    };

    loadProfile();
  }, [user]);

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          if (profile) {
              await updateJobSeekerProfile(user.userId, formData);
              alert("Profile updated successfully.");
          } else {
              await createJobSeekerProfile(user.userId, formData);
              alert("Profile created successfully.");
          }
          setEditMode(false);
      } catch (err) {
          console.error("Error updating profile:", err);
          setError("Failed to update profile.");
      }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;


  return (
    <div>
        <h2>Your Profile</h2>
        {profile && !editMode ? (
            <div>
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Age:</strong> {profile.age}</p>
                <p><strong>Gender:</strong> {profile.gender}</p>
                <p><strong>Skills:</strong> {profile.skills}</p>
                <p><strong>Description:</strong> {profile.description}</p>
                <button onClick={() => setEditMode(true)}>Edit Profile</button>
            </div>
        ) : (
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" />
                <input type="text" name="gender" value={formData.gender} onChange={handleChange} placeholder="Gender" />
                <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="Skills (comma-separated)" />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description"></textarea>
                <button type="submit">{profile ? "Update Profile" : "Create Profile"}</button>
            </form>
        )}
    </div>
);
};

export default ProfilePage;
