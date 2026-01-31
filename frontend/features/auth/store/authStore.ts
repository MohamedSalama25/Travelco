import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

/**
 * User interface
 */
export interface User {
    id: string;
    email: string;
    name?: string;
    user_name?: string;
    role?: string;
    phone?: string;
    companyId?: string;
    companyName?: string;
}

/**
 * Auth store state interface
 */
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    companyId: string | null;
    companyName: string | null;

    // Actions
    setUser: (user: User) => void;
    setToken: (token: string) => Promise<void>;
    login: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    clearUser: () => Promise<void>;
    initializeAuth: () => void;
}

const AUTH_COOKIE_KEY = 'auth_token';

/**
 * Auth store using Zustand
 * Persists token in cookies (js-cookie) directly
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            companyId: null,
            companyName: null,

            /**
             * Initialize auth - now handled by Zustand persist middleware
             * This function is kept for backward compatibility
             */
            initializeAuth: () => {
                // Zustand persist middleware handles everything automatically
                // No manual initialization needed
            },

            /**
             * Set user data
             */
            setUser: (user: User) => {
                set({
                    user,
                    isAuthenticated: !!user,
                    companyId: user?.companyId || null,
                    companyName: user?.companyName || null
                });
            },

            /**
             * Set authentication token
             * - Save in Zustand state
             * - Save directly in cookies via js-cookie
             */
            setToken: async (token: string) => {
                // Store in state
                set({ token, isAuthenticated: true });

                // Store in cookies directly
                Cookies.set(AUTH_COOKIE_KEY, token, {
                    expires: 7,
                });
            },

            /**
             * Login - set both user and token
             * - Save in Zustand state
             * - Save directly in cookies via js-cookie
             */
            login: async (user: User, token: string) => {
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    companyId: user?.companyId || null,
                    companyName: user?.companyName || null
                });

                // Store token in cookies directly
                Cookies.set(AUTH_COOKIE_KEY, token, {
                    expires: 7,
                });
            },

            /**
             * Logout - clear all auth data
             * - Clear Zustand state
             * - Remove token cookie
             */
            logout: async () => {
                // Remove cookies
                Cookies.remove(AUTH_COOKIE_KEY);

                // Clear state
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    companyId: null,
                    companyName: null
                });
            },

            /**
             * Clear user data
             * - Same as logout
             */
            clearUser: async () => {
                // Remove cookies
                Cookies.remove(AUTH_COOKIE_KEY);

                // Clear state
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    companyId: null,
                    companyName: null
                });
            },
        }),
        {
            name: 'auth-storage',
            // Store all auth data in localStorage for persistence
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                companyId: state.companyId,
                companyName: state.companyName,
            }),
        }
    )
);

/**
 * Hook to get current user
 */
export const useCurrentUser = () => {
    const user = useAuthStore((state) => state.user);
    return user;
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated;
};

/**
 * Hook to get auth token
 */
export const useAuthToken = () => {
    const token = useAuthStore((state) => state.token);
    return token;
};

/**
 * Hook to get current company info
 */
export const useCurrentCompany = () => {
    const companyId = useAuthStore((state) => state.companyId);
    const companyName = useAuthStore((state) => state.companyName);
    return { companyId, companyName };
};
