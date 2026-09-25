import { jsx as _jsx } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import { router } from './router';
import './index.css';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
        },
    },
});
export function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthProvider, { children: _jsx(RouterProvider, { router: router }) }) }));
}
