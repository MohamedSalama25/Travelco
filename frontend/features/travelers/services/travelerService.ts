import { clientAxios } from '@/lib/api/axios';
import { API_CONFIG } from '@/lib/api/config';
import { TravelersListResponse, Traveler, TravelerFilters } from '../types/types';

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
            if (filters.status === 'overdue') {
                // overdue = partial + unpaid (excluding cancel and paid)
                query.append('status', 'partial,unpaid');
            } else {
                query.append('status', filters.status);
            }
        }
        if (filters?.fromDate) {
            query.append('fromDate', filters.fromDate);
        }
        if (filters?.toDate) {
            query.append('toDate', filters.toDate);
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

export async function cancelTraveler(id: string, payload: {
    cancel_reason: string;
    cancel_tax: number;
    cancel_commission: number;
}): Promise<{ success: boolean, message: string, data: Traveler }> {
    try {
        const response = await clientAxios.put(
            API_CONFIG.ENDPOINTS.TRAVELERS.CANCEL(id),
            payload
        );
        return response.data;
    } catch (error) {
        console.error("Failed to cancel traveler", error);
        throw error;
    }
}

export async function refundTraveler(id: string): Promise<{ success: boolean, message: string, data: Traveler }> {
    try {
        const response = await clientAxios.put(
            API_CONFIG.ENDPOINTS.TRAVELERS.REFUND(id)
        );
        return response.data;
    } catch (error) {
        console.error("Failed to refund traveler", error);
        throw error;
    }
}

export async function addPayment(payload: {
    transfer: string;
    amount: number;
    payment_method: string;
    notes?: string;
    payment_date?: string;
}): Promise<{ success: boolean, message: string }> {
    try {
        const response = await clientAxios.post(
            API_CONFIG.ENDPOINTS.PAYMENTS.CREATE,
            payload
        );
        return response.data;
    } catch (error) {
        console.error("Failed to add payment", error);
        throw error;
    }
}

export async function exportTravelersToExcel(filters?: TravelerFilters): Promise<void> {
    try {
        const query = new URLSearchParams();

        if (filters?.bookingNumber) {
            query.append('booking_number', filters.bookingNumber);
        }
        if (filters?.name) {
            query.append('name', filters.name);
        }
        if (filters?.status && filters.status !== 'all') {
            if (filters.status === 'overdue') {
                query.append('status', 'partial,unpaid');
            } else {
                query.append('status', filters.status);
            }
        }
        if (filters?.fromDate) {
            query.append('fromDate', filters.fromDate);
        }
        if (filters?.toDate) {
            query.append('toDate', filters.toDate);
        }
        if (filters?.createdAt) {
            query.append('createdAt', filters.createdAt);
        }

        const response = await clientAxios.get(
            `${API_CONFIG.ENDPOINTS.TRAVELERS.EXPORT_EXCEL}?${query.toString()}`,
            {
                responseType: 'blob'
            }
        );

        // Create a blob from the response
        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `travelers_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export travelers to Excel", error);
        throw error;
    }
}

