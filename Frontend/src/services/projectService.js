import api from './apiService';

export const projectService = {
  
    getProjectsForUser: () => {
        return api.get('/projects/my-projects');
    },
    
    getAllProjects: () => {
        return api.get('/projects/get-all-projects');
    },

    getProjectById: (id) => {
        return api.get(`/projects/get-by-id/${id}`);
    },

    
    createProject: (projectCreateDto) => {
        return api.post('/projects/create-project', projectCreateDto);
    },

    updateProject: (id, projectUpdateDto) => {
        return api.put(`/projects/update-project/${id}`, projectUpdateDto);
    },

   
    deleteProject: (id) => {
        return api.delete(`/projects/delete-project/${id}`);
    },

    
    searchProjects: (name) => {
    return api.get('/projects/search', { params: { name } });
    },

    cancelProject: (projectId) => {
        // Bu, backend'de oluşturacağınız yeni bir endpoint olmalı
        return api.put(`/projects/${projectId}/cancel`); 
    }
};