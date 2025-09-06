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

    // logout fonksiyonunu useCallback ile sarmalayarak gereksiz yeniden oluşturulmasını engelliyoruz.
    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    }, []);

    // refreshUser, en güncel kullanıcı bilgisini API'dan çeker.
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
                    // Token'ın süresinin dolup dolmadığını kontrol et
                    if (decodedToken.exp * 1000 > Date.now()) {
                        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        await refreshUser();
                    } else {
                        logout(); // Süresi dolmuş token
                    }
                }
            } catch (error) {
                console.error("Oturum başlatma hatası:", error);
                logout(); // Geçersiz token
            } finally {
                // Kontrol işlemi bitti, yükleme durumunu kapat
                setLoading(false);
            }
        };

        initializeAuth();
    }, [refreshUser, logout]);

    const login = (token) => {
        localStorage.setItem('authToken', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        refreshUser(); // Giriş yapınca en güncel kullanıcı verisini çek
    };
    
    // Dışarıya sunulan değerler
    const value = { user, loading, login, logout, refreshUser, isAuthenticated: !!user };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
