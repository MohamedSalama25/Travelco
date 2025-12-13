import { clientAxios } from '@/lib/api/axios';
import { API_CONFIG } from '@/lib/api/config';
import { TravelersListResponse, TravelerStatsResponse, Traveler } from '../types/types';

export interface TravelerFilters {
    bookingNumber?: string;
    name?: string;
    status?: string;
    createdAt?: string;
}

export async function getTravelers(
    page: number = 1,
    filters?: TravelerFilters
): Promise<TravelersListResponse> {
    try {
        const query = new URLSearchParams();
        query.append('page', String(page));

        if (filters?.bookingNumber) {
            query.append('booking_number', filters.bookingNumber);
        }
        if (filters?.name) {
            query.append('name', filters.name);
        }
        if (filters?.status && filters.status !== 'all') {
            query.append('status', filters.status);
        }
        if (filters?.createdAt) {
            query.append('createdAt', filters.createdAt);
        }

        const response = await clientAxios.get<TravelersListResponse>(
            `${API_CONFIG.ENDPOINTS.TRAVELERS.LIST}?${query.toString()}`
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
            API_CONFIG.ENDPOINTS.TRAVELERS.STATS
        );
        return response.data;
    } catch (error) {
        console.error("Failed to fetch stats", error);
        throw error;
    }
}

export async function getTraveler(id: string): Promise<Traveler> {
    try {
        // Traveler details are essentially transfer details, so we might need a specific endpoint
        // Assuming we can re-use the update endpoint which usually gets by ID, or a specific GET
        // For now, let's assume `transfers/${id}` or `customers/${id}/transfers` logic if specific transfer
        // But based on config, we might not have a direct Transfer ID endpoint visible in USER's provided config snippet
        // The user config has TRANSFERS.LIST and TRANSFERS.STATS.
        // I will assume I can do a GET on `transfers` with a query or a new endpoint.
        // Let's try `transfers/${id}` assuming standard REST conventions not explicitly in config yet.

        const response = await clientAxios.get<{ success: boolean, data: Traveler }>(
            `transfers/${id}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Failed to fetch traveler", error);
        throw error;
    }
}

export async function createTraveler(traveler: any): Promise<Traveler> {
    try {
        const response = await clientAxios.post(
            API_CONFIG.ENDPOINTS.TRAVELERS.CREATE,
            traveler
        );
        return response.data;
    } catch (error) {
        console.error("Failed to create traveler", error);
        throw error;
    }
}

export async function updateTraveler(id: string, traveler: any): Promise<Traveler> {
    try {
        const response = await clientAxios.put(
            API_CONFIG.ENDPOINTS.TRAVELERS.UPDATE(id),
            traveler
        );
        return response.data;
    } catch (error) {
        console.error("Failed to update traveler", error);
        throw error;
    }
}

export async function deleteTraveler(id: string): Promise<{ success: boolean, message: string }> {
    try {
        await clientAxios.delete(
            API_CONFIG.ENDPOINTS.TRAVELERS.DELETE(id)
        );
        return {
            success: true,
            message: "Traveler deleted successfully"
        }
    } catch (error) {
        throw error;
    }
}
