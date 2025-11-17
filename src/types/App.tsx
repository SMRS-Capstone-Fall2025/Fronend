import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Import all pages
import ErrorBoundary from "./components/error-boundary";
import AdminAccount from "./pages/admin/account";
import AdminDashboard from "./pages/admin/dashboard";
import AdminReports from "./pages/admin/reports/financial";
import AdminUsers from "./pages/admin/users";
import AdminProjectsPage from "./pages/admin/projects";
import Login from "./pages/login";
import ForgotPassword from "./pages/forgot-password";
import NotFound from "./pages/not-found";
import StudentProfile from "./pages/student/profile";
import StudentTasks from "./pages/student/tasks";
import StudentProjects from "./pages/student/projects";
import StudentProgress from "./pages/student/progress";
import StudentInvitations from "./pages/student/invitations";
import MentorProjects from "./pages/mentor/projects";
import MentorTasks from "./pages/mentor/tasks";
import MentorProgress from "./pages/mentor/progress";
import MentorProfile from "./pages/mentor/profile";
import MentorInvitations from "./pages/mentor/invitations";
import DeanDashboardPage from "./pages/dean/dashboard";
import DeanCouncilsPage from "./pages/dean/councils";
import DeanProjectsPage from "./pages/dean/projects";

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/student"
            element={<Navigate to="/student/projects" replace />}
          />
          <Route path="/student/tasks" element={<StudentTasks />} />
          <Route path="/student/progress" element={<StudentProgress />} />
          <Route path="/student/projects" element={<StudentProjects />} />
          <Route path="/student/invitations" element={<StudentInvitations />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route
            path="/instructor"
            element={<Navigate to="/instructor/dashboard" replace />}
          />
          <Route
            path="/mentor"
            element={<Navigate to="/mentor/projects" replace />}
          />
          <Route
            path="/mentor/dashboard"
            element={<Navigate to="/mentor/projects" replace />}
          />
          <Route path="/mentor/tasks" element={<MentorTasks />} />
          <Route path="/mentor/progress" element={<MentorProgress />} />
          <Route path="/mentor/projects" element={<MentorProjects />} />
          <Route path="/mentor/invitations" element={<MentorInvitations />} />
          <Route path="/mentor/profile" element={<MentorProfile />} />

          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/projects" element={<AdminProjectsPage />} />
          <Route path="/admin/account" element={<AdminAccount />} />
          <Route path="/admin/reports/financial" element={<AdminReports />} />
          <Route
            path="/staff"
            element={<Navigate to="/staff/dashboard" replace />}
          />
          <Route
            path="/dean"
            element={<Navigate to="/dean/dashboard" replace />}
          />
          <Route path="/dean/dashboard" element={<DeanDashboardPage />} />
          <Route path="/dean/councils" element={<DeanCouncilsPage />} />
          <Route path="/dean/projects" element={<DeanProjectsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
