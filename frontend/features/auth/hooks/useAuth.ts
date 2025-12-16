import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { loginUser, registerUser, LoginPayload, RegisterPayload, LoginResponse } from '../services/authService';

/**
 * Hook for login mutation
 */
export const useLogin = () => {
    const { login: setAuth } = useAuthStore();

    return useMutation({
        mutationFn: async (payload: LoginPayload) => {
            const data = await loginUser(payload);
            return data;
        },
        onSuccess: async (data: LoginResponse) => {
            // ده هيخزن التوكين في الـ state + الكوكيز
            await setAuth(data.user, data.token);
        },
    });
};

/**
 * Hook for register mutation
 */
export const useRegister = () => {
    const { login: setAuth } = useAuthStore();

    return useMutation({
        mutationFn: async (payload: RegisterPayload) => {
            const data = await registerUser(payload);
            return data;
        },
        onSuccess: async (data: LoginResponse) => {
            // نفس فكرة الـ login
            await setAuth(data.user, data.token);
        },
    });
};

/**
 * Hook for logout
 */
export const useLogout = () => {
    const { logout } = useAuthStore();
    // ده هيمسح التوكين من الـ state + من الكوكيز
    return logout;
};
