import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
export function LoginForm({ onSubmit, isLoading = false }) {
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(loginSchema),
    });
    const handleFormSubmit = async (data) => {
        try {
            setError('');
            await onSubmit(data.email, data.password);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        }
    };
    return (_jsx("div", { className: "w-full max-w-md mx-auto", children: _jsxs("form", { onSubmit: handleSubmit(handleFormSubmit), className: "card space-y-4", children: [_jsx("h1", { className: "text-2xl font-bold text-center mb-6", children: "Skill Check Assessment" }), error && (_jsxs("div", { className: "flex items-center gap-2 p-3 bg-danger-100 text-danger-700 rounded-lg", children: [_jsx(AlertCircle, { size: 20 }), _jsx("span", { children: error })] })), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium mb-2", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-3 text-gray-400", size: 20 }), _jsx("input", { id: "email", type: "email", className: "input-field pl-10", placeholder: "your@email.com", ...register('email'), disabled: isLoading })] }), errors.email && _jsx("p", { className: "text-danger-600 text-sm mt-1", children: errors.email.message })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium mb-2", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 text-gray-400", size: 20 }), _jsx("input", { id: "password", type: "password", className: "input-field pl-10", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", ...register('password'), disabled: isLoading })] }), errors.password && _jsx("p", { className: "text-danger-600 text-sm mt-1", children: errors.password.message })] }), _jsx("button", { type: "submit", className: "btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed", disabled: isLoading, children: isLoading ? 'Logging in...' : 'Login' }), _jsx("p", { className: "text-sm text-gray-600 text-center", children: "Demo credentials: guru@example.com / admin@example.com / student@example.com" })] }) }));
}
