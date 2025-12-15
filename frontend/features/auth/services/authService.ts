import { clientAxios } from '@/lib/api/axios';
import { API_CONFIG } from '@/lib/api/config';
import { AxiosError } from 'axios';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    user_name: string;
    email: string;
    phone: string;
    password: string;
}

// Defining response types locally or importing if they exist.
// useAuth had them defined strictly inside the file. I should export them or redefine them.
// Preferably I should move types to types.ts but for now i'll define them here or import if possible.
// I'll define generic interfaces for now to match the user's "use strict pattern" request which implies
// standalone functions.

export interface LoginResponse {
    user: {
        id: string;
        email: string;
        name?: string;
        role?: string;
    };
    token: string;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
    const response = await clientAxios.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        payload
    );
    return response.data;
}

export async function registerUser(payload: RegisterPayload): Promise<LoginResponse> {
    const response = await clientAxios.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        payload
    );
    return response.data;
}
