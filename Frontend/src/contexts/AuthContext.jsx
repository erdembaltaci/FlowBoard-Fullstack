import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // Bu paketi projenize ekleyin: npm install jwt-decode
import { userService } from '../services/userService';
import api from '../services/apiService';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
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
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    const decodedToken = jwtDecode(token);
                    if (decodedToken.exp * 1000 > Date.now()) {
                        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        await refreshUser();
                    } else {
                        logout();
                    }
                }
            } catch (error) {
                console.error("Oturum başlatma hatası:", error);
                logout();
            } finally {
                setLoading(false);
            }
        };
        initializeAuth();
    }, [refreshUser, logout]);

    const login = (token) => {
        localStorage.setItem('authToken', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        refreshUser();
    };
    
    const value = { user, loading, login, logout, refreshUser, isAuthenticated: !!user };
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
