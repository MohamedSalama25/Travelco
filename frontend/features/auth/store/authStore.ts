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
    role?: string;
}

/**
 * Auth store state interface
 */
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;

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

            /**
             * Initialize auth from cookies
             */
            initializeAuth: () => {
                const token = Cookies.get(AUTH_COOKIE_KEY);
                if (token) {
                    set({ token, isAuthenticated: true });
                }
            },

            /**
             * Set user data
             */
            setUser: (user: User) => {
                set({ user, isAuthenticated: !!user });
            },

            /**
             * Set authentication token
             * - Save in Zustand state
             * - Save directly in cookies via js-cookie
             */
            setToken: async (token: string) => {
                // خزن في الـ state
                set({ token, isAuthenticated: true });

                // خزن في الكوكيز مباشرة
                Cookies.set(AUTH_COOKIE_KEY, token, {
                    // عدّل الـ expires على مزاجك (بالأيام)
                    expires: 7,
                });
            },

            /**
             * Login - set both user and token
             * - Save in Zustand state
             * - Save directly in cookies via js-cookie
             */
            login: async (user: User, token: string) => {
                set({ user, token, isAuthenticated: true });

                // خزن التوكين في الكوكيز مباشرة
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
                // امسح الكوكيز
                Cookies.remove(AUTH_COOKIE_KEY);

                // نظّف الـ state
                set({ user: null, token: null, isAuthenticated: false });
            },

            /**
             * Clear user data
             * - Same as logout (لو حابب تفصلهم تقدر لاحقًا)
             */
            clearUser: async () => {
                // امسح الكوكيز
                Cookies.remove(AUTH_COOKIE_KEY);

                // نظّف الـ state
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
            // إحنا هنا بس بنخزن الـ user في localStorage
            // التوكين بقى في الكوكيز بس
            partialize: (state) => ({
                user: state.user,
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
