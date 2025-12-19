"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import Cookies from 'js-cookie';

/**
 * Component to initialize auth from cookies on client-side
 * This prevents hydration errors by only running on client
 */
export function AuthInitializer() {
    useEffect(() => {
        const token = Cookies.get('auth_token');
        if (token) {
            useAuthStore.setState({
                token,
                isAuthenticated: true
            });
        }
    }, []);

    return null;
}
