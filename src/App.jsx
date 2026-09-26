import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentDetailPage from './pages/StudentDetailPage';
import AdminMasterDataPage from './pages/AdminMasterDataPage';
import AssessmentChecklistPage from './pages/AssessmentChecklistPage';
import DashboardAnalyticsPage from './pages/DashboardAnalyticsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/student/:studentId" element={<StudentDetailPage />} />
          <Route path="/student/:studentId/skill/:skillId/assessment" element={<AssessmentChecklistPage />} />
          <Route path="/admin" element={<AdminMasterDataPage />} />
          <Route path="/analytics" element={<DashboardAnalyticsPage />} />
          <Route path="/" element={<DashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
