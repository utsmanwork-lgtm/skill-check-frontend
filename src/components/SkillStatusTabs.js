import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle2, Clock } from 'lucide-react';
export function SkillStatusTabs({ activeTab, onTabChange, pendingCount = 0, completedCount = 0, }) {
    return (_jsxs("div", { className: "flex gap-2 border-b border-gray-200", children: [_jsxs("button", { onClick: () => onTabChange('pending'), className: `flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === 'pending'
                    ? 'border-warning-500 text-warning-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'}`, children: [_jsx(Clock, { size: 18 }), _jsxs("span", { children: ["Pending (", pendingCount, ")"] })] }), _jsxs("button", { onClick: () => onTabChange('completed'), className: `flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === 'completed'
                    ? 'border-success-500 text-success-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'}`, children: [_jsx(CheckCircle2, { size: 18 }), _jsxs("span", { children: ["Completed (", completedCount, ")"] })] })] }));
}
