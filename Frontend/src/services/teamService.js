import api from './apiService';

export const teamService = {
   
    getTeamsForUser: () => {
        return api.get('/teams/my-teams');
    },

    getTeamById: (id) => {
        return api.get(`/teams/get-by-id/${id}`);
    },
 
    createTeam: (teamCreateDto) => {
        return api.post('/teams/create-team', teamCreateDto);
    },

    addUserToTeam: (teamId, addUserToTeamDto) => {
        return api.post(`/teams/${teamId}/add-member`, addUserToTeamDto);
    },

    removeUserFromTeam: (teamId, userId) => {
        return api.delete(`/teams/${teamId}/remove-member/${userId}`);
    },
    updateTeam: (id, teamUpdateDto) => {
        return api.put(`/teams/${id}`, teamUpdateDto);
    },
    deleteTeam: (id) => {
        return api.delete(`/teams/${id}`);
    }

};