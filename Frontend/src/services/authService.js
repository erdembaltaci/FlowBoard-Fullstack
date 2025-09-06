import api from './apiService';

export const authService = {
    /**
     * Yeni bir kullanıcı kaydı oluşturur. SADECE metin tabanlı verileri gönderir.
     * @param {object} userData - { fullName, username, email, password }
     * @returns {Promise<any>} - Başarılı olursa { user, token } döner.
     * Backend Endpoint: POST /api/auth/user-register
     */
    register: (userData) => {
        // Artık FormData'ya gerek yok, çünkü sadece JSON verisi gönderiyoruz.
        // Ancak backend'iniz [FromForm] beklediği için hala FormData kullanmak daha güvenli olabilir.
        const formData = new FormData();
        formData.append('FullName', userData.fullName);
        formData.append('Username', userData.username);
        formData.append('Email', userData.email);
        formData.append('Password', userData.password);

        return api.post('/auth/user-register', formData);
    },

    /**
     * Kullanıcının avatarını yükler. Bu işlem için geçerli bir token gereklidir.
     * @param {File} avatarFile - Kullanıcının seçtiği resim dosyası.
     * @param {string} token - Kullanıcı kayıt olduktan sonra alınan JWT token'ı.
     * @returns {Promise<any>}
     * Backend Endpoint: POST /api/uploads/avatar
     */
    uploadAvatar: (avatarFile, token) => {
        const formData = new FormData();
        formData.append('avatar', avatarFile); // Controller'daki beklenen alan adı 'avatar'

        // API isteğini, içeriğin 'multipart/form-data' olduğunu ve yetkilendirme token'ını içerdiğini belirterek gönderiyoruz.
        return api.post('/uploads/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            },
        });
    },

    /**
     * Kullanıcı girişi yapar ve JWT token'ı döner.
     * @param {object} loginDto - { email, password }
     * @returns {Promise<any>}
     */
    login: (loginDto) => {
        return api.post('/auth/user-login', loginDto);
    },

    forgotPassword: (email) => {
        return api.post('/auth/forgot-password', { email });
    },

    resetPassword: (resetDto) => {
        return api.post('/auth/reset-password', resetDto);
    }
};
