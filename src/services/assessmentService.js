import { apiClient } from './api';
export const assessmentService = {
    getStudents: async (classFilter) => {
        return apiClient.get('/students', {
            params: { class: classFilter },
        });
    },
    getSkills: async (category) => {
        return apiClient.get('/skills', {
            params: { category },
        });
    },
    getStudentSkills: async (studentId) => {
        return apiClient.get(`/assessments/student/${studentId}`);
    },
    saveAssessment: async (studentId, skillChecks) => {
        return apiClient.post('/assessments', {
            studentId,
            skillChecks,
        });
    },
    getAnalyticsHeatmap: async () => {
        return apiClient.get('/analytics/heatmap');
    },
    getGapAnalysis: async () => {
        return apiClient.get('/analytics/gap-analysis');
    },
};
