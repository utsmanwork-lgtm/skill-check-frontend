export type UserRole = 'guru' | 'admin' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthContext {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  status: 'active' | 'inactive';
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface SkillCheck {
  id: string;
  studentId: string;
  skillId: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface SkillChecklistItem {
  skill: Skill;
  completed: boolean;
  checked: boolean;
}

export interface AnalyticsData {
  studentId: string;
  studentName: string;
  skillId: string;
  skillName: string;
  completed: boolean;
}

export interface GapAnalysisData {
  skillId: string;
  skillName: string;
  completionRate: number;
  studentCount: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
