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
            CANCEL: (id: string) => `transfers/${id}/cancel`,
            REFUND: (id: string) => `transfers/${id}/refund`,
            EXPORT_EXCEL: 'transfers/export/excel',
        },
        AIRCOMPS: {
            LIST: 'airComp',
            STATS: 'airComp/stats',
            CREATE: 'airComp',
            UPDATE: (id: string) => `airComp/${id}`,
            DELETE: (id: string) => `airComp/${id}`,
        },
        PAYMENTS: {
            CREATE: 'payments',
            DELETE: (id: string) => `payments/${id}`,
        },
        TREASURY: {
            LIST: 'treasury/history',
            STATS: 'treasury/stats',
            EXPORT_EXCEL: 'treasury/export/excel',
        },
        USERS: {
            LIST: 'users',
            DETAILS: (id: string) => `users/${id}`,
            CREATE: 'users',
            UPDATE: (id: string) => `users/${id}`,
            DELETE: (id: string) => `users/${id}`,
        },
        ADVANCES: {
            LIST: 'advances',
            STATS: 'advances/stats',
            CREATE: 'advances',
            UPDATE_STATUS: (id: string) => `advances/${id}/status`,
            REPAY: (id: string) => `advances/${id}/repay`,
            DELETE: (id: string) => `advances/${id}`,
        }
    },
} as const;

export type ApiConfig = typeof API_CONFIG;
