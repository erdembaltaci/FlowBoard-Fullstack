import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { userService } from '../services/userService';
import api from '../services/apiService';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    const decodedToken = jwtDecode(token);
                    if (decodedToken.exp * 1000 > Date.now()) {
                        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        const response = await userService.getMyProfile();
                        setUser(response.data);
                    } else {
                        localStorage.removeItem('authToken');
                    }
                }
            } catch (error) {
                console.error("Oturum başlatma hatası:", error);
                localStorage.removeItem('authToken');
            } finally {
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
    
    const value = { user, loading, login, logout, isAuthenticated: !!user };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
