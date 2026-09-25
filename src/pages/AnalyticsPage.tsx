import { useQuery } from '@tanstack/react-query';
import { assessmentService } from '@services/assessmentService';
import { AnalyticsHeatmap } from '@components/AnalyticsHeatmap';
import { GapAnalysisReport } from '@components/GapAnalysisReport';
import { useAuth } from '@contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AnalyticsPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const { data: heatmapData = [], isLoading: heatmapLoading } = useQuery({
    queryKey: ['analytics', 'heatmap'],
    queryFn: () => assessmentService.getAnalyticsHeatmap(),
  });

  const { data: gapData = [], isLoading: gapLoading } = useQuery({
    queryKey: ['analytics', 'gap'],
    queryFn: () => assessmentService.getGapAnalysis(),
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-sm text-gray-600">Performance Overview • {user?.name}</p>
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

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        <AnalyticsHeatmap data={heatmapData} loading={heatmapLoading} />
        <GapAnalysisReport data={gapData} loading={gapLoading} />
      </main>
    </div>
  );
}
