import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import JobsPage from "../pages/JobsPage";
import RecommendationsPage from "../pages/RecommendationsPage";
import AppliedJobsPage from "../pages/AppliedJobsPage";
import ProfilePage from "../pages/ProfilePage";
import EmployerSignup from "../pages/EmployerSignup";
import EmployerLogin from "../pages/EmployerLogin";
import JobSeekerSignup from "../pages/JobSeekerSignup";
import JobSeekerLogin from "../pages/JobSeekerLogin";
import MyPostedJobs from "../pages/recruiters/MyPostedJobs";
import PostJob from "../pages/recruiters/PostJob";
import EditJob from "../pages/recruiters/EditJob";
import ViewApplicants from "../pages/recruiters/ViewApplicants";
import RecruiterProfilePage from "../pages/RecruiterProfilePage";
import ApplyJobPage from "../pages/ApplyJobPage";

import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ element, allowedRoles }) => {
  const { user } = useAuth();
  return user && allowedRoles.includes(user.role) ? element : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/recommendations" element={<RecommendationsPage />} />
      <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} allowedRoles={["job_seeker"]} />} />
      <Route path="/applied-jobs" element={<PrivateRoute element={<AppliedJobsPage />} allowedRoles={["job_seeker"]} />} />
      <Route path="/apply-job/:jobId"  element={<PrivateRoute element={<ApplyJobPage />} allowedRoles={["job_seeker"]} />} />
      <Route path="/employer-signup" element={<EmployerSignup />} />
      <Route path="/employer-login" element={<EmployerLogin />} />
      <Route path="/signup" element={<JobSeekerSignup />} />
      <Route path="/login" element={<JobSeekerLogin />} />
      <Route path="/my-posted-jobs" element={<PrivateRoute element={<MyPostedJobs />} allowedRoles={["recruiter"]} />} />
      <Route path="/post-job" element={<PrivateRoute element={<PostJob />} allowedRoles={["recruiter"]} />} />
      <Route path="/edit-job/:jobId" element={<PrivateRoute element={<EditJob />} allowedRoles={["recruiter"]} />} />
      <Route path="/view-applicants" element={<PrivateRoute element={<ViewApplicants />} allowedRoles={["recruiter"]} />} />
      <Route path="/view-applicants/:jobId" element={<PrivateRoute element={<ViewApplicants />} allowedRoles={["recruiter"]} />} />
      <Route path="/recruiter-profile" element={<PrivateRoute element={<RecruiterProfilePage />} allowedRoles={["recruiter"]} />} />
    </Routes>
  );
};

export default AppRoutes;