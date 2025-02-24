import React, { useEffect, useState } from "react";
import { fetchRecruiterProfile, createRecruiterProfile, updateRecruiterProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";

const RecruiterProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    agency_name: "",
    agency_location: "",
    license_number: "",
    contact_email: ""
  });

  useEffect(() => {
    if (!user || !user.userId) {
        setError("User not found. Please log in.");
        setLoading(false);
        return;
    }

    const loadProfile = async () => {
        try {
            const response = await fetchRecruiterProfile(user.userId);
            if (response) {
                setProfile(response);
                setFormData(response);
            } else {
              setError("No profile found. You may need to create one.");
            }
        } catch (err) {
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
              await updateRecruiterProfile(user.userId, formData);
              alert("Profile updated successfully.");
          } else {
              await createRecruiterProfile(user.userId, formData);
              alert("Profile created successfully.");
          }
          setEditMode(false);
      } catch (err) {
          setError("Failed to update profile.");
      }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
        <h2>Your Agency Profile</h2>
        {profile && !editMode ? (
            <div>
                <p><strong>Agency Name:</strong> {profile.agency_name}</p>
                <p><strong>Location:</strong> {profile.agency_location}</p>
                <p><strong>License Number:</strong> {profile.license_number}</p>
                <p><strong>Contact Email:</strong> {profile.contact_email}</p>
                <button onClick={() => setEditMode(true)}>Edit Profile</button>
            </div>
        ) : (
            <form onSubmit={handleSubmit}>
                <input type="text" name="agency_name" value={formData.agency_name} onChange={handleChange} placeholder="Agency Name" required />
                <input type="text" name="agency_location" value={formData.agency_location} onChange={handleChange} placeholder="Location" required />
                <input type="text" name="license_number" value={formData.license_number} onChange={handleChange} placeholder="License Number" required />
                <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} placeholder="Contact Email" required />
                <button type="submit">{profile ? "Update Profile" : "Create Profile"}</button>
            </form>
        )}
    </div>
  );
};

export default RecruiterProfilePage;
