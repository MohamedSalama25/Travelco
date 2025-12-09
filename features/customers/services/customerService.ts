import { clientAxios } from '@/lib/api/axios';
import { API_CONFIG } from '@/lib/api/config';
import { CustomersListResponse } from '../types/types';
import { AxiosError } from 'axios';

export async function getCustomers(
    page: number = 1,
    name?: string,
    signal?: AbortSignal
): Promise<CustomersListResponse> {
    try {
        const query = new URLSearchParams();
        query.append('page', String(page));

        if (name) {
            query.append('name', name);
        }

        const response = await clientAxios.get<CustomersListResponse>(
            `${API_CONFIG.ENDPOINTS.CUSTOMERS.LIST}?${query.toString()}`,
            { signal }
        );

        return {
            success: true,
            data: response.data.data,
            can_add: response.data.can_add,
            pagination: response.data.pagination,
        };
    } catch (error) {
        console.error("Failed to fetch users", error);
        const err = error as AxiosError<{ message?: string }>;
        const message =
            err.response?.data?.message || "Something went wrong while fetching users";
        return {
            success: false,
            data: [],
            pagination: {
                total: 0,
                page: page,
                limit: 10,
                pages: 0
            },
        };
    }
}
