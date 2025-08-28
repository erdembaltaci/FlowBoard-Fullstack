import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { userService } from '../services/userService'; // userService'i import ediyoruz
import api from '../services/apiService'; // apiService'i de import ediyoruz

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Uygulama ilk yüklendiğinde token'ı kontrol et ve kullanıcı bilgilerini API'dan çek
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const decodedToken = jwtDecode(token);
                    const currentTime = Date.now() / 1000;

                    if (decodedToken.exp > currentTime) {
                        // Token geçerli, şimdi API'dan en güncel kullanıcı bilgisini alalım
                        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        const response = await userService.getMyProfile();
                        setUser(response.data); // Artık fullName, avatarUrl gibi tüm bilgiler var
                    } else {
                        // Token süresi dolmuş
                        localStorage.removeItem('token');
                    }
                }
            } catch (error) {
                // Token geçersizse veya API'dan kullanıcı bilgisi alınamazsa (örn. kullanıcı silinmişse)
                // güvenli bir şekilde çıkış yap
                console.error("Auth initialize error:", error);
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (token) => {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
            // Giriş yapıldığında token'ı çözmek yerine,
            // doğrudan API'dan en güncel ve tam kullanıcı bilgisini çekiyoruz.
            const response = await userService.getMyProfile();
            setUser(response.data); // Bu, fullName, avatarUrl ve en önemlisi güncel 'role' bilgisini anında alır.
        } catch (error) {
            console.error("Login sonrası profil alınamadı:", error);
            // Hata durumunda, güvenli bir şekilde çıkış yap.
            logout();
        }
    };

    // Profil sayfasında bilgi güncellendiğinde bu fonksiyon çağrılacak
    const refreshUser = async () => {
        try {
            const response = await userService.getMyProfile();
            setUser(response.data);
        } catch (error) {
            console.error("Kullanıcı bilgisi yenilenemedi.", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const value = { user, loading, login, logout, refreshUser };

    if (loading) {
        // Bütün sayfayı kaplayan şık bir yüklenme ekranı
        return (
            <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Uygulama Yükleniyor...</div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};