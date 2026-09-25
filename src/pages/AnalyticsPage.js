import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white border-b border-gray-200 sticky top-0 z-50", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Analytics & Reports" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Performance Overview \u2022 ", user?.name] })] }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors", children: [_jsx(LogOut, { size: 20 }), "Logout"] })] }) }), _jsxs("main", { className: "max-w-7xl mx-auto p-4 space-y-6", children: [_jsx(AnalyticsHeatmap, { data: heatmapData, loading: heatmapLoading }), _jsx(GapAnalysisReport, { data: gapData, loading: gapLoading })] })] }));
}
