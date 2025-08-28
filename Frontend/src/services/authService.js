import api from './apiService';

export const authService = {
    /**
     * Yeni bir kullanıcı kaydı oluşturur. Profil fotoğrafı da içerebilir.
     * @param {object} registerData - { username, email, password, firstName, lastName, profilePicture? }
     * @returns {Promise<any>}
     * Backend Endpoint: POST /api/auth/user-register
     */
    register: (registerData) => {
        const formData = new FormData();
        
        // Anahtarları backend'in beklediği PascalCase formatında manuel olarak ekliyoruz.
        formData.append('FirstName', registerData.firstName);
        formData.append('LastName', registerData.lastName);
        formData.append('Username', registerData.username);
        formData.append('Email', registerData.email);
        formData.append('Password', registerData.password);

        // Eğer bir profil fotoğrafı seçilmişse, onu da ekle
        if (registerData.profilePicture) {
            formData.append('ProfilePicture', registerData.profilePicture);
        }

        // API isteğini, içeriğin 'multipart/form-data' olduğunu belirterek gönderiyoruz.
        return api.post('/auth/user-register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * Kullanıcı girişi yapar ve JWT token'ı döner.
     * @param {object} loginDto - { email, password }
     * @returns {Promise<{data: {token: string}}>}
     * Backend Endpoint: POST /api/auth/user-login
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