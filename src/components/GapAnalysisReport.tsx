import type { GapAnalysisData } from '@types';
import { TrendingDown } from 'lucide-react';

interface GapAnalysisReportProps {
  data: GapAnalysisData[];
  loading?: boolean;
}

export function GapAnalysisReport({ data, loading = false }: GapAnalysisReportProps) {
  const sortedData = [...data].sort((a, b) => a.completionRate - b.completionRate);
  const maxRate = Math.max(...data.map((d) => d.completionRate), 100);

  if (loading) {
    return <div className="card p-4 text-center text-gray-500">Loading report...</div>;
  }

  if (data.length === 0) {
    return <div className="card p-4 text-center text-gray-500">No data available</div>;
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <TrendingDown className="text-warning-600" size={24} />
        <h2 className="text-lg font-semibold">Skill Gap Analysis</h2>
      </div>

      <div className="space-y-4">
        {sortedData.map((skill) => {
          const percentage = Math.round((skill.completionRate / maxRate) * 100);
          const status =
            skill.completionRate >= 80 ? 'success' : skill.completionRate >= 50 ? 'warning' : 'danger';

          return (
            <div key={skill.skillId} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 text-sm flex-1">{skill.skillName}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold text-${status}-600`}>
                    {skill.completionRate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">({skill.studentCount} students)</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all bg-${status}-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-success-600">
            {data.filter((d) => d.completionRate >= 80).length}
          </p>
          <p className="text-xs text-gray-600">Strong Skills</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-warning-600">
            {data.filter((d) => d.completionRate >= 50 && d.completionRate < 80).length}
          </p>
          <p className="text-xs text-gray-600">Developing</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-danger-600">
            {data.filter((d) => d.completionRate < 50).length}
          </p>
          <p className="text-xs text-gray-600">Needs Work</p>
        </div>
      </div>
    </div>
  );
}
