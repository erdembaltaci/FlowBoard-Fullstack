import api from './apiService';

export const issueService = {
   
    getIssuesByProjectId: (projectId) => {
        return api.get(`/issues/get-by-project-id/${projectId}`);
    },

    getIssueById: (issueId) => {
        return api.get(`/issues/get-by-id/${issueId}`);
    },

    createIssue: (createDto) => {
        return api.post('/issues/create-issue', createDto);
    },

    updateIssue: (issueId, updateDto) => {
        return api.put(`/issues/update-issue/${issueId}`, updateDto);
    },    
 
    moveIssue: (issueId, moveDto) => {
        return api.put(`/issues/move-issue/${issueId}`, moveDto);
    },

    deleteIssue: (issueId) => {
        return api.delete(`/issues/delete-issue/${issueId}`);
    },
    
    filterIssues: (filterParams) => {
        // filterParams: { projectId: 1, status: "ToDo" } gibi bir objedir.
        // axios bunu otomatik olarak ?projectId=1&status=ToDo'ya çevirir.
        return api.get('/issues/filter-issues', { params: filterParams });
    },

    getIssuesByTeamId: (teamId) => {
        return api.get(`/issues/get-by-team-id/${teamId}`);
    }
};