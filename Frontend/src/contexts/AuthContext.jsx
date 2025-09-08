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
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                logout();
                return;
            }
            const response = await userService.getMyProfile();
            setUser(response.data);
        } catch (error) {
            console.error("Kullanıcı bilgisi yenilenemedi, oturum sonlandırılıyor.", error);
            logout();
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
                        logout();
                    }
                } catch {
                    logout();
                }
            }
            setLoading(false);
        };
        initializeAuth();
    }, [refreshUser, logout]);

    // --- EN KRİTİK DEĞİŞİKLİK BURADA ---
    const login = async (token) => {
        localStorage.setItem('authToken', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Hafızayı (user state'ini) güncelleme işleminin BİTMESİNİ BEKLE.
        await refreshUser();
    };
    
    const value = { user, loading, login, logout, refreshUser, isAuthenticated: !!user };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
