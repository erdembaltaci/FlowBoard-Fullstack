import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/layout/Header';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WorkspacePage from './pages/WorkspacePage';
import ProjectsListPage from './pages/ProjectsListPage';
import TeamsListPage from './pages/TeamsListPage';
import TeamDetailPage from './pages/TeamDetailPage';
import IssueListPage from './pages/IssueListPage'; 
import IssueBoardPage from './pages/IssueBoardPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';


const MainLayout = () => (
  <div className="min-h-screen w-full bg-slate-900">
    <Header />
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Outlet />
    </main>
  </div>
);
function App() {
    const { user , oading } = useAuth();
    if (loading) {  
      return (
        <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Yükleniyor...</div>
        </div>
      );
    }
    return (
        
            <Routes>
                <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/workspace" />} />
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/workspace" />} />
                <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/workspace" />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} /> 
                

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
                
                <Route path="*" element={<Navigate to={user ? "/workspace" : "/"} />} />
            </Routes>
        
    );
}

export default App;
