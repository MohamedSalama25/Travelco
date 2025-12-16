import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientAxios } from '@/lib/api/axios';
import { API_CONFIG } from '@/lib/api/config';
import {
    Customer,
    CustomerFormData,
    CustomerDetailsResponse,
    CustomerResponse,
} from '../types/types';
import { getCustomers } from '../services/customerService';
import { useCustomersStore } from '../store/customersStore';

/**
 * Query keys for customers
 */
export const customersKeys = {
    all: ['customers'] as const,
    lists: () => [...customersKeys.all, 'list'] as const,
    list: (page: number, search?: string) =>
        [...customersKeys.lists(), { page, search }] as const,
    details: () => [...customersKeys.all, 'detail'] as const,
    detail: (id: string, page: number) =>
        [...customersKeys.details(), id, { page }] as const,
};

/**
 * Hook to fetch customers list
 */
export function useCustomers() {
    const { currentPage, searchQuery } = useCustomersStore();

    const { data, isLoading, isFetching, isError, error } = useQuery({
        queryKey: customersKeys.list(currentPage, searchQuery),
        queryFn: ({ signal }) => getCustomers(currentPage, searchQuery, signal),
        placeholderData: (previousData) => previousData,
    });

    const customers = data?.data || [];
    const can_add = data?.can_add || false;
    const pagination = data?.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
    };

    return { customers, can_add, pagination, isLoading, isFetching, isError, error };
}

/**
 * Hook to fetch customer details with transfers
 */
export const useCustomer = (id: string, page: number = 1) => {
    return useQuery({
        queryKey: customersKeys.detail(id, page),
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
            });

            const response = await clientAxios.get<CustomerDetailsResponse>(
                `${API_CONFIG.ENDPOINTS.CUSTOMERS.DETAILS(id)}?${params}`
            );
            return response.data;
        },
        enabled: !!id,
    });
};


