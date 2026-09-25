import { CheckCircle2, Clock } from 'lucide-react';

interface SkillStatusTabsProps {
  activeTab: 'pending' | 'completed';
  onTabChange: (tab: 'pending' | 'completed') => void;
  pendingCount?: number;
  completedCount?: number;
}

export function SkillStatusTabs({
  activeTab,
  onTabChange,
  pendingCount = 0,
  completedCount = 0,
}: SkillStatusTabsProps) {
  return (
    <div className="flex gap-2 border-b border-gray-200">
      <button
        onClick={() => onTabChange('pending')}
        className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${
          activeTab === 'pending'
            ? 'border-warning-500 text-warning-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        <Clock size={18} />
        <span>Pending ({pendingCount})</span>
      </button>

      <button
        onClick={() => onTabChange('completed')}
        className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${
          activeTab === 'completed'
            ? 'border-success-500 text-success-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        <CheckCircle2 size={18} />
        <span>Completed ({completedCount})</span>
      </button>
    </div>
  );
}
