import { createContext, useContext } from 'react';
import type { Role } from '../types';

export interface AuthUser {
    accessToken: string;
    email: string;
    fullName: string;
    role: Role;
    expiresAt: number;
}

export interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<AuthUser>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
    return ctx;
}
