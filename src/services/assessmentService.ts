import { apiClient } from './api';
import type { Student, Skill, SkillCheck } from '@types';

export const assessmentService = {
  getStudents: async (classFilter?: string): Promise<Student[]> => {
    return apiClient.get<Student[]>('/students', {
      params: { class: classFilter },
    });
  },

  getSkills: async (category?: string): Promise<Skill[]> => {
    return apiClient.get<Skill[]>('/skills', {
      params: { category },
    });
  },

  getStudentSkills: async (studentId: string): Promise<SkillCheck[]> => {
    return apiClient.get<SkillCheck[]>(`/assessments/student/${studentId}`);
  },

  saveAssessment: async (studentId: string, skillChecks: { skillId: string; completed: boolean }[]): Promise<SkillCheck[]> => {
    return apiClient.post<SkillCheck[]>('/assessments', {
      studentId,
      skillChecks,
    });
  },

  getAnalyticsHeatmap: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/analytics/heatmap');
  },

  getGapAnalysis: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/analytics/gap-analysis');
  },
};
