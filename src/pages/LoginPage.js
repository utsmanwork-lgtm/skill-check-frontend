import { jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from '@contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@components/LoginForm';
import { useState } from 'react';
export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const handleLogin = async (email, password) => {
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4", children: _jsx(LoginForm, { onSubmit: handleLogin, isLoading: isLoading }) }));
}
