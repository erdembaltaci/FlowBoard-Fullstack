import api from './apiService';

export const authService = {
    register: (userData) => {
        const formData = new FormData();
        formData.append('FirstName', userData.firstName);
        formData.append('LastName', userData.lastName);
        formData.append('Username', userData.username);
        formData.append('Email', userData.email);
        formData.append('Password', userData.password);
        return api.post('/auth/user-register', formData);
    },

    login: (loginData) => {
        return api.post('/auth/user-login', loginData);
    },

    uploadAvatar: (avatarFile) => {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        return api.post('/uploads/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // --- YENİ EKLENEN FONKSİYON ---
    refreshToken: () => {
        // Bu istek, apiService interceptor'ı sayesinde mevcut (artık eski olan)
        // token ile gönderilir ve karşılığında yeni, güncel bir token alır.
        return api.post('/auth/refresh-token');
    },

    forgotPassword: (email) => {
        return api.post('/auth/forgot-password', { email });
    },

    resetPassword: (resetDto) => {
        return api.post('/auth/reset-password', resetDto);
    }
};
