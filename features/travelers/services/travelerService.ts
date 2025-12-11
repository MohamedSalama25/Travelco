import { clientAxios } from '@/lib/api/axios';
import { API_CONFIG } from '@/lib/api/config';
import { TravelersListResponse, TravelerStatsResponse } from '../types/types';

export async function getTravelers(
    page: number = 1,
    search?: string
): Promise<TravelersListResponse> {
    try {
        const query = new URLSearchParams();
        query.append('page', String(page));
        if (search) {
            query.append('search', search);
        }

        const response = await clientAxios.get<TravelersListResponse>(
            `${API_CONFIG.ENDPOINTS.TRANSFERS.LIST}?${query.toString()}`
        );
        return response.data;
    } catch (error) {
        console.error("Failed to fetch travelers", error);
        throw error;
    }
}

export async function getTravelerStats(): Promise<TravelerStatsResponse> {
    try {
        const response = await clientAxios.get<TravelerStatsResponse>(
            API_CONFIG.ENDPOINTS.TRANSFERS.STATS
        );
        return response.data;
    } catch (error) {
        console.error("Failed to fetch stats", error);
        throw error;
    }
}
