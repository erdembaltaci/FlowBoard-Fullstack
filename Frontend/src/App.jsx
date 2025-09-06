import React, { useEffect } from "react"; // useEffect ekledik
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/layout/Header";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WorkspacePage from "./pages/WorkspacePage";
import ProjectsListPage from "./pages/ProjectsListPage";
import TeamsListPage from "./pages/TeamsListPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import IssueListPage from "./pages/IssueListPage";
import IssueBoardPage from "./pages/IssueBoardPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const MainLayout = () => (
  <div className="min-h-screen w-full bg-slate-900">
    <Header />
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Outlet />
    </main>
  </div>
);

function App() {
  const { user } = useAuth();

  // 🔹 Sunucuyu canlı tutmak için ping
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://senin-api.onrender.com/health")
        .then((res) => console.log("Frontend Ping:", res.status))
        .catch((err) => console.error("Frontend Ping failed", err));
    }, 4 * 60 * 1000); // 4 dakikada bir

    return () => clearInterval(interval);
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={!user ? <LandingPage /> : <Navigate to="/workspace" />}
      />
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/workspace" />}
      />
      <Route
        path="/register"
        element={!user ? <RegisterPage /> : <Navigate to="/workspace" />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/teams" element={<TeamsListPage />} />
          <Route path="/team/:teamId" element={<TeamDetailPage />} />
          <Route path="/project/:projectId/issues" element={<IssueListPage />} />
          <Route path="/project/:projectId/board" element={<IssueBoardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? "/workspace" : "/"} />} />
    </Routes>
  );
}

export default App;
