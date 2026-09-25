import { useAuth } from '@contexts/AuthContext';
import { LogOut, Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminPanelPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-600">System Administration • {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
          <div className="card space-y-4">
            <div className="flex items-center gap-3">
              <Users className="text-primary-600" size={28} />
              <div>
                <h2 className="text-lg font-semibold">User Management</h2>
                <p className="text-sm text-gray-600">Manage system users and roles</p>
              </div>
            </div>
            <button className="btn-primary w-full">Manage Users</button>
          </div>

          <div className="card space-y-4">
            <div className="flex items-center gap-3">
              <Settings className="text-primary-600" size={28} />
              <div>
                <h2 className="text-lg font-semibold">System Settings</h2>
                <p className="text-sm text-gray-600">Configure system parameters</p>
              </div>
            </div>
            <button className="btn-primary w-full">Settings</button>
          </div>
        </div>

        <div className="mt-6 card">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
            <div className="p-4 bg-success-50 rounded-lg">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-2xl font-bold text-success-600">Healthy</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">API Version</p>
              <p className="text-2xl font-bold text-blue-600">v1.0.0</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-2xl font-bold text-gray-600">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
