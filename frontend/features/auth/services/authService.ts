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
    company_name?: string;
}

export interface LoginResponse {
    success: boolean;
    user: {
        id: string;
        email: string;
        name?: string;
        user_name?: string;
        role?: string;
        phone?: string;
        companyId?: string;
        companyName?: string;
    };
    token: string;
    message?: string;
}

export interface RegisterResponse {
    success: boolean;
    user: {
        id: string;
        email: string;
        name?: string;
        user_name?: string;
        role?: string;
        phone?: string;
        companyId?: string;
        companyName?: string;
    };
    company: {
        _id: string;
        name: string;
    };
    token: string;
    message?: string;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
    const response = await clientAxios.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        payload
    );
    return response.data;
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
    const response = await clientAxios.post<RegisterResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        payload
    );
    return response.data;
}

export async function updateProfile(data: any): Promise<any> {
    const response = await clientAxios.put(
        '/users/profile',
        data
    );
    return response.data;
}
