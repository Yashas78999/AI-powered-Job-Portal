import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Public Pages
import Home from './pages/Home';
import JobSearch from './pages/JobSearch';
import JobDetail from './pages/JobDetail';

// Seeker Pages
import SeekerDashboard from './pages/seeker/Dashboard';
import SeekerProfile from './pages/seeker/Profile';
import MyApplications from './pages/seeker/MyApplications';
import ResumeUpload from './pages/seeker/ResumeUpload';
import AIRecommendations from './pages/seeker/AIRecommendations';

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard';
import PostJob from './pages/employer/PostJob';
import ManageJobs from './pages/employer/ManageJobs';
import Applicants from './pages/employer/Applicants';

// Layout
import Navbar from './components/common/Navbar';

// ─── Protected Route Guards ────────────────────────────────────────────────────

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

// ─── App Router ────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobSearch />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        {/* Auth */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Seeker Routes */}
        <Route path="/seeker" element={<ProtectedRoute role="SEEKER"><SeekerDashboard /></ProtectedRoute>} />
        <Route path="/seeker/profile" element={<ProtectedRoute role="SEEKER"><SeekerProfile /></ProtectedRoute>} />
        <Route path="/seeker/applications" element={<ProtectedRoute role="SEEKER"><MyApplications /></ProtectedRoute>} />
        <Route path="/seeker/resume" element={<ProtectedRoute role="SEEKER"><ResumeUpload /></ProtectedRoute>} />
        <Route path="/seeker/recommendations" element={<ProtectedRoute role="SEEKER"><AIRecommendations /></ProtectedRoute>} />

        {/* Employer Routes */}
        <Route path="/employer" element={<ProtectedRoute role="EMPLOYER"><EmployerDashboard /></ProtectedRoute>} />
        <Route path="/employer/post-job" element={<ProtectedRoute role="EMPLOYER"><PostJob /></ProtectedRoute>} />
        <Route path="/employer/jobs" element={<ProtectedRoute role="EMPLOYER"><ManageJobs /></ProtectedRoute>} />
        <Route path="/employer/jobs/:jobId/applicants" element={<ProtectedRoute role="EMPLOYER"><Applicants /></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
