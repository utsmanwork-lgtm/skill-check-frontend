import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TrendingDown } from 'lucide-react';
export function GapAnalysisReport({ data, loading = false }) {
    const sortedData = [...data].sort((a, b) => a.completionRate - b.completionRate);
    const maxRate = Math.max(...data.map((d) => d.completionRate), 100);
    if (loading) {
        return _jsx("div", { className: "card p-4 text-center text-gray-500", children: "Loading report..." });
    }
    if (data.length === 0) {
        return _jsx("div", { className: "card p-4 text-center text-gray-500", children: "No data available" });
    }
    return (_jsxs("div", { className: "card space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TrendingDown, { className: "text-warning-600", size: 24 }), _jsx("h2", { className: "text-lg font-semibold", children: "Skill Gap Analysis" })] }), _jsx("div", { className: "space-y-4", children: sortedData.map((skill) => {
                    const percentage = Math.round((skill.completionRate / maxRate) * 100);
                    const status = skill.completionRate >= 80 ? 'success' : skill.completionRate >= 50 ? 'warning' : 'danger';
                    return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-medium text-gray-900 text-sm flex-1", children: skill.skillName }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: `text-sm font-semibold text-${status}-600`, children: [skill.completionRate.toFixed(1), "%"] }), _jsxs("span", { className: "text-xs text-gray-500", children: ["(", skill.studentCount, " students)"] })] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 overflow-hidden", children: _jsx("div", { className: `h-full transition-all bg-${status}-500`, style: { width: `${percentage}%` } }) })] }, skill.skillId));
                }) }), _jsxs("div", { className: "pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-success-600", children: data.filter((d) => d.completionRate >= 80).length }), _jsx("p", { className: "text-xs text-gray-600", children: "Strong Skills" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-warning-600", children: data.filter((d) => d.completionRate >= 50 && d.completionRate < 80).length }), _jsx("p", { className: "text-xs text-gray-600", children: "Developing" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-danger-600", children: data.filter((d) => d.completionRate < 50).length }), _jsx("p", { className: "text-xs text-gray-600", children: "Needs Work" })] })] })] }));
}
