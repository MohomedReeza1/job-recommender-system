import React, { useEffect, useState } from "react";
// import { api } from "../services/api";

const MyPostedJobs = () => {

  useEffect(() => {
    const fetchMyPostedJobs = async () => {
      try {
      } catch (error) {
      }
    };
    fetchMyPostedJobs();
  }, []);

  return (
    <div className="container">
      <h2>My Posted Jobs</h2>
    </div>
  );
};

export default MyPostedJobs;
