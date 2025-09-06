import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                logout(); // Token yoksa çıkış yap ve işlemi bitir.
                return;
            }
            // userService'teki fonksiyon adınızın 'getMyProfile' olduğundan emin olun.
            const response = await userService.getMyProfile(); 
            setUser(response.data);
        } catch (error) {
            console.error("Kullanıcı bilgisi yenilenemedi, oturum sonlandırılıyor.", error);
            logout(); // Hata durumunda güvenli çıkış yap.
        }
    }, [logout]);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    if (decodedToken.exp * 1000 > Date.now()) {
                        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        await refreshUser();
                    } else {
                        logout(); // Süresi dolmuş token
                    }
                } catch (error) {
                    console.error("Geçersiz token, oturum temizleniyor.", error);
                    logout(); // Token decode edilemiyorsa geçersizdir
                }
            }
            // Token olmasa bile yüklemenin bittiğini belirt.
            setLoading(false);
        };
        initializeAuth();
    }, [refreshUser, logout]);

    const login = (token) => {
        // Token'ı 'authToken' adıyla localStorage'a kaydet.
        localStorage.setItem('authToken', token); 
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        refreshUser(); // Giriş yapınca en güncel kullanıcı verisini çek.
    };
    
    const value = { user, loading, login, logout, refreshUser, isAuthenticated: !!user };
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
