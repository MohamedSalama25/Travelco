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
export const useCustomers = (page: number = 1, search?: string) => {
    return useQuery({
        queryKey: customersKeys.list(page, search),
        queryFn: async () => {
            const response = await getCustomers(page, search);
            return response;
        },
    });
};

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


