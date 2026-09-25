import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
export function UnauthorizedPage() {
    const navigate = useNavigate();
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "card max-w-md text-center space-y-4", children: [_jsx(AlertCircle, { className: "mx-auto text-danger-600", size: 48 }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Access Denied" }), _jsx("p", { className: "text-gray-600", children: "You don't have permission to access this page. Please contact your administrator." }), _jsx("button", { onClick: () => navigate(-1), className: "btn-primary w-full", children: "Go Back" })] }) }));
}
