import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Bu paketi projenize ekleyin: npm install jwt-decode
import { userService } from '../services/userService';
import api from '../services/apiService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth, bir AuthProvider içinde kullanılmalıdır.");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // En başta oturum kontrolü için yükleniyor

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    const decodedToken = jwtDecode(token);
                    const currentTime = Date.now() / 1000;

                    if (decodedToken.exp > currentTime) {
                        // Token geçerli, API'dan en güncel kullanıcı bilgisini al
                        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        const response = await userService.getMyProfile();
                        setUser(response.data);
                    } else {
                        // Token süresi dolmuş
                        localStorage.removeItem('authToken');
                    }
                }
            } catch (error) {
                console.error("Oturum başlatma hatası:", error);
                localStorage.removeItem('authToken');
                setUser(null);
            } finally {
                // Kontrol işlemi bitti, yükleme durumunu kapat
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (token) => {
        localStorage.setItem('authToken', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
            const response = await userService.getMyProfile();
            setUser(response.data);
        } catch (error) {
            console.error("Giriş sonrası profil alınamadı:", error);
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const response = await userService.getMyProfile();
            setUser(response.data);
        } catch (error) {
            console.error("Kullanıcı bilgisi yenilenemedi.", error);
            logout();
        }
    };
    
    const value = { user, loading, login, logout, refreshUser, isAuthenticated: !!user };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
