/**
 * API Configuration
 * Contains base URL and endpoint constants
 */

export const API_CONFIG = {
    BASE_URL: 'http://localhost:3200/api/',
    ENDPOINTS: {
        AUTH: {
            LOGIN: 'auth/login',
            REGISTER: 'auth/register',
        },
        CUSTOMERS: {
            LIST: 'customers',
            DETAILS: (id: string) => `customers/${id}/transfers`,
            CREATE: 'customers',
            UPDATE: (id: string) => `customers/${id}`,
            DELETE: (id: string) => `customers/${id}`,
        },
        TRANSFERS: {
            LIST: 'transfers',
            STATS: 'transfers/stats',
        },
    },
} as const;

export type ApiConfig = typeof API_CONFIG;
