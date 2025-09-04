import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Token kontrolü bitmeden hiçbir yönlendirme yapma
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  // Kullanıcı yoksa login'e yönlendir
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Kullanıcı varsa korunan sayfayı aç
  return <Outlet />;
};

export default ProtectedRoute;
