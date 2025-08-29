import api from './apiService';

export const authService = {
    /**
     * Yeni bir kullanıcı kaydı oluşturur. Profil fotoğrafı da içerebilir.
     * @param {object} registerData - { username, email, password, firstName, lastName, profilePicture? }
     * @returns {Promise<any>}
     * Backend Endpoint: POST /api/auth/user-register
     */
    registerWithFormData: (registerData) => {
        const formData = new FormData();
        
        formData.append('FirstName', registerData.firstName);
        formData.append('LastName', registerData.lastName);
        formData.append('Username', registerData.username);
        formData.append('Email', registerData.email);
        formData.append('Password', registerData.password);

        if (registerData.profilePicture) {
            formData.append('ProfilePicture', registerData.profilePicture);
        }

        return api.post('/auth/user-register-form', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * Yeni kullanıcı kaydı (JSON).
     * Backend Endpoint: POST /api/auth/user-register-json
     */
    registerWithJson: (registerData) => {
        return api.post('/auth/user-register-json', {
            FirstName: registerData.firstName,
            LastName: registerData.lastName,
            Username: registerData.username,
            Email: registerData.email,
            Password: registerData.password
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
