import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from './config';
import Cookies from 'js-cookie';

/**
 * Get authentication token from cookies
 */
const getAuthToken = (): string | null => {
    return Cookies.get('auth_token') || null;
};

/**
 * Create axios instance with base configuration
 */
const createAxiosInstance = (isServer: boolean = false): AxiosInstance => {
    const instance = axios.create({
        baseURL: API_CONFIG.BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Add request interceptor to include auth token
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = isServer ? null : getAuthToken();
            if (token) {
                config.headers.Authorization = `${token}`;
            }
            return config;
        },
        (error: AxiosError) => {
            return Promise.reject(error);
        }
    );

    // Add response interceptor for error handling
    instance.interceptors.response.use(
        (response: AxiosResponse) => response,
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                // Clear auth token on unauthorized
                Cookies.remove('auth_token');
                // Optional: Redirect to login or handle logout globally
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

// Create instances
export const serverAxios = createAxiosInstance(true);
export const clientAxios = createAxiosInstance(false);

