import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-md text-center space-y-4">
        <AlertCircle className="mx-auto text-danger-600" size={48} />
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600">
          You don't have permission to access this page. Please contact your administrator.
        </p>
        <button onClick={() => navigate(-1)} className="btn-primary w-full">
          Go Back
        </button>
      </div>
    </div>
  );
}
