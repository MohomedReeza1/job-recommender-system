import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import JobsPage from "./pages/JobsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import ApplyJobPage from "./pages/ApplyJobPage";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/apply-job/:jobId" element={<ApplyJobPage />} />
      </Routes>
    </Router>
  );
};

export default App;
