import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { loginUser, registerUser, LoginPayload, RegisterPayload, LoginResponse, RegisterResponse } from '../services/authService';

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
            // Store user with companyId and companyName
            const user = {
                ...data.user,
                companyId: data.user.companyId,
                companyName: data.user.companyName,
            };
            await setAuth(user, data.token);
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
        onSuccess: async (data: RegisterResponse) => {
            // Store user with company info from registration
            const user = {
                ...data.user,
                companyId: data.user.companyId || data.company?._id,
                companyName: data.user.companyName || data.company?.name,
            };
            await setAuth(user, data.token);
        },
    });
};

/**
 * Hook for logout
 */
export const useLogout = () => {
    const { logout } = useAuthStore();
    return logout;
};
