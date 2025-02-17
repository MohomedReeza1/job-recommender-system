import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import JobsPage from "./pages/JobsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import AppliedJobsPage from "./pages/AppliedJobsPage";
import ProfilePage from "./pages/ProfilePage";
import Footer from "./components/Footer";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/applied-jobs" element={<AppliedJobsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
