import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
});

// Giden her isteğe token'ı ekleyen interceptor
api.interceptors.request.use(
    (config) => {
        // DEĞİŞİKLİK: 'token' yerine 'authToken' kullanıldı
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Gelen tüm yanıtları kontrol eden interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // 401 hatası alındığında (token geçersiz veya süresi dolmuş)
            if (error.response.status === 401) {
                // DEĞİŞİKLİK: 'token' yerine 'authToken' kullanıldı
                localStorage.removeItem('authToken');
                // Sadece zaten login sayfasında değilsek yönlendirme yap
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            // 403 hatası (yetki yok)
            if (error.response.status === 403) {
                toast.error("Bu işlemi yapmak için yetkiniz yok.");
            }
        }
        return Promise.reject(error);
    }
);

export default api;
