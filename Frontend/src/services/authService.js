import api from './apiService';

export const authService = {
    /**
     * Yeni bir kullanıcı kaydı oluşturur.
     */
    register: (userData) => {
        const formData = new FormData();
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
     * @param {File} avatarFile - Yüklenecek dosya.
     * @param {string} token - Login işleminden hemen sonra alınan taze token.
     */
    uploadAvatar: (avatarFile, token) => {
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        return api.post('/uploads/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            },
        });
    },
};
