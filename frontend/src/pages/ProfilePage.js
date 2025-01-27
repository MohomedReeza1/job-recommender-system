import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const ProfilePage = () => {
  const [profile, setProfile] = useState({});
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Replace with actual user ID or authentication logic
        const userId = 1; 
        const profileData = await api.get(`/profile/${userId}`);
        const jobsData = await api.get(`/applied-jobs/${userId}`);
        setProfile(profileData.data);
        setAppliedJobs(jobsData.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <div className="container">
      <h2>Your Profile</h2>
      <div>
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Skills:</strong> {profile.skills?.join(", ")}</p>
      </div>

      <h3>Applied Jobs</h3>
      <ul>
        {appliedJobs.map((job) => (
          <li key={job.id}>{job.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProfilePage;
