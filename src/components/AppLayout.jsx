import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppLayout({ children, title = null }) {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-f8fafc">
      <nav className="bg-white border-b border-e5e7eb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Skill Check</h1>
          <div className="flex gap-4 items-center">
            <div className="text-gray-700 text-sm">
              <span className="font-medium">{profile?.nama}</span>
              <span className="text-gray-500 ml-2">({profile?.role})</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-d1d5db rounded hover:bg-f3f4f6 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
