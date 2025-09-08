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

    updateMyProfile: (profileData) => {
        return api.put('/users/me', {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          username: profileData.username,
          email: profileData.email,
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
