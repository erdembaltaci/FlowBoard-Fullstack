import React, { useEffect } from "react";
// DEĞİŞİKLİK: 'BrowserRouter as Router' ve 'AuthProvider' import'ları kaldırıldı.
import { Routes, Route, Navigate, Outlet } from "react-router-dom"; 
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/layout/Header";

// Sayfa Bileşenleri
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

// Header gibi ortak bileşenleri içeren ana layout
const MainLayout = () => (
  <div className="min-h-screen w-full bg-slate-900">
    <Header />
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Outlet /> 
    </main>
  </div>
);

// Giriş yapmış kullanıcıların login gibi sayfalara gitmesini engelleyen yardımcı bileşen
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center text-white">Yükleniyor...</div>;
    }
    return isAuthenticated ? <Navigate to="/workspace" /> : children;
};


// DEĞİŞİKLİK: Artık 'AppRoutes' diye bir ara bileşene gerek yok.
// 'App' bileşeni doğrudan yönlendirme mantığını döndürüyor.
function App() {
  // Sunucuyu canlı tutmak için periyodik istek (ping)
  useEffect(() => {
    const interval = setInterval(() => {
      // ÖNEMLİ: Bu URL'yi kendi Render backend adresinizle değiştirmeyi unutmayın!
      fetch("https://flowboard-backend.onrender.com/health") 
        .then((res) => console.log("Sunucuya ping gönderildi:", res.status))
        .catch((err) => console.error("Sunucuya ping gönderilemedi:", err));
    }, 14 * 60 * 1000); // Render'ın ücretsiz servisleri için 14 dakikada bir idealdir.

    return () => clearInterval(interval);
  }, []);

  return (
    <Routes>
      {/* Herkesin Erişebileceği Rotalar */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Sadece Giriş Yapmış Kullanıcıların Erişebileceği Korumalı Rotalar */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/projects" element={<ProjectsListPage />} />
        <Route path="/teams" element={<TeamsListPage />} />
        <Route path="/team/:teamId" element={<TeamDetailPage />} />
        <Route path="/project/:projectId/issues" element={<IssueListPage />} />
        <Route path="/project/:projectId/board" element={<IssueBoardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Eşleşmeyen tüm rotalar için yönlendirme */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// DEĞİŞİKLİK: Dışarıya sarmalayıcı değil, doğrudan App bileşeni ihraç ediliyor.
export default App;
