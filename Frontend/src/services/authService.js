import api from './apiService';

export const authService = {
    /**
     * Yeni bir kullanıcı kaydı oluşturur.
     */
    register: (userData) => {
        const formData = new FormData();
        
        // --- EN KRİTİK DEĞİŞİKLİK BURADA ---
        // Artık formdaki 'firstName' ve 'lastName' alanlarını,
        // backend'in beklediği 'FirstName' ve 'LastName' anahtarlarıyla doğru bir şekilde gönderiyoruz.
        formData.append('FirstName', userData.firstName);
        formData.append('LastName', userData.lastName);
        formData.append('Username', userData.username);
        formData.append('Email', userData.email);
        formData.append('Password', userData.password);

        return api.post('/auth/user-register', formData);
    },

    /**
     * Kullanıcı girişi yapar ve JWT token'ı döner.
     */
    login: (loginData) => {
        return api.post('/auth/user-login', loginData);
    },

    /**
     * Kullanıcının avatarını yükler.
     */
    uploadAvatar: (avatarFile) => {
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        // DEĞİŞİKLİK: Manuel token eklemeye gerek yok.
        // Bu istek, apiService interceptor'ı sayesinde token'ı otomatik olarak alır.
        return api.post('/uploads/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    forgotPassword: (email) => {
        return api.post('/auth/forgot-password', { email });
    },

    resetPassword: (resetDto) => {
        return api.post('/auth/reset-password', resetDto);
    }
};
