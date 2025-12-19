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
        TRAVELERS: {
            LIST: 'transfers',
            STATS: 'transfers/stats',
            CREATE: 'transfers',
            UPDATE: (id: string) => `transfers/${id}`,
            DELETE: (id: string) => `transfers/${id}`,

        },
        AIRCOMPS: {
            LIST: 'airComp',
            STATS: 'airComp/stats',
            CREATE: 'airComp',
            UPDATE: (id: string) => `airComp/${id}`,
            DELETE: (id: string) => `airComp/${id}`,
        },
    },
} as const;

export type ApiConfig = typeof API_CONFIG;
