import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentDetailPage from './pages/StudentDetailPage';
import AdminMasterDataPage from './pages/AdminMasterDataPage';
import AssessmentChecklistPage from './pages/AssessmentChecklistPage';
import DashboardAnalyticsPage from './pages/DashboardAnalyticsPage';
import AdminUsersPage from './pages/AdminUsersPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/student/:studentId" element={<ProtectedRoute requiredRole="guru"><StudentDetailPage /></ProtectedRoute>} />
        <Route path="/student/:studentId/skill/:skillId/assessment" element={<ProtectedRoute requiredRole="guru"><AssessmentChecklistPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminMasterDataPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute requiredRole="admin"><DashboardAnalyticsPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
