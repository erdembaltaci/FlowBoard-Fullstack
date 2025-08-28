import api from './apiService';

export const userService = {
    getAllUsers: () => {
        return api.get('/users/get-all-users');
    },

    getUserById: (id) => {
        return api.get(`/users/get-user-by-id/${id}`);
    },

    updateUser: (id, userUpdateDto) => {
        return api.put(`/users/update-user/${id}`, userUpdateDto);
    },

    deleteUser: (id) => {
        return api.delete(`/users/delete-user/${id}`);
    },

    changeUserRole: (roleChangeDto) => {
        return api.put('/users/change-role', roleChangeDto);
    },
    getMyProfile: () => api.get('/users/me'),
    // src/services/userService.js

    updateMyProfile : (profileData) => {
        const formData = new FormData();
    
    // Anahtarları backend'in beklediği PascalCase formatında manuel olarak ekliyoruz.
        formData.append('FirstName', profileData.firstName);
        formData.append('LastName', profileData.lastName);
        formData.append('Username', profileData.username);
        formData.append('Email', profileData.email);

    // Eğer yeni bir profil fotoğrafı seçilmişse, onu da ekle
        if (profileData.profilePicture) {
            formData.append('ProfilePicture', profileData.profilePicture);
        }

        return api.put('/users/me', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    changeMyPassword: (dto) => api.post('/users/me/change-password', dto),
    searchUsers: (searchTerm) => {
        return api.get(`/users/search?query=${searchTerm}`);
    },
    getDashboardStats: () => {
    return api.get('/users/me/stats');
    },

    getMyOpenTasks: () => {
        return api.get('/users/me/tasks');
    }
};