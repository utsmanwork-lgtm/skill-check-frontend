import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@services/authService';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const savedUser = authService.getCurrentUser();
        setUser(savedUser);
        setLoading(false);
    }, []);
    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await authService.login(email, password);
            setUser(response.user);
        }
        finally {
            setLoading(false);
        }
    };
    const logout = () => {
        authService.logout();
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: { user, loading, login, logout }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
