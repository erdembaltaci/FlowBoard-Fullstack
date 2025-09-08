import api from './apiService';

export const userService = {
  
  getMyProfile: () => api.get('/users/me'),
    
  updateMyProfile: (profileData) => {
    // Artık FormData değil, backend'in [FromBody] ile beklediği gibi JSON gönderiyoruz.
    return api.put('/users/me', {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      username: profileData.username,
      email: profileData.email,
    });
  },
  
  changeMyPassword: (dto) => api.post('/users/me/change-password', dto),

  getDashboardStats: () => {
    return api.get('/users/me/stats');
  },

  getMyOpenTasks: () => {
    return api.get('/users/me/tasks');
  },

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

  searchUsers: (searchTerm) => {
    return api.get(`/users/search?query=${searchTerm}`);
  },
};
