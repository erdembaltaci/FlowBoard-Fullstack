import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // 1. AuthContext, oturumu kontrol ediyorsa (loading === true),
    // bir yüklenme ekranı göster ve BEKLE. Yönlendirme kararı verme.
    if (loading) {
        return (
            <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Oturum Kontrol Ediliyor...</div>
            </div>
        );
    }

    // 2. Yükleme bittiğinde, kullanıcı giriş yapmamışsa (isAuthenticated === false), login sayfasına yönlendir.
    if (!isAuthenticated) {
        // Kullanıcının gitmek istediği sayfayı state'e ekliyoruz ki,
        // giriş yaptıktan sonra oraya geri dönebilsin.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Yükleme bitti ve kullanıcı giriş yapmışsa, gitmek istediği sayfayı (children) göster.
    return children;
};

export default ProtectedRoute;
