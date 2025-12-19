import { clientAxios } from '@/lib/api/axios';
import { API_CONFIG } from '@/lib/api/config';
import { Customer, CustomerResponse, CustomersListResponse } from '../types/types';
import axios, { AxiosError } from 'axios';
import { CustomerSchemaType } from '../types/schema';

export async function getCustomers(
    page: number = 1,
    search?: string,
    signal?: AbortSignal
): Promise<CustomersListResponse> {
    try {
        const query = new URLSearchParams();
        query.append('page', String(page));
        if (search) {
            query.append('name', search);
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
        if (axios.isCancel(error)) {
            throw error;
        }
        console.error("Failed to fetch customers", error);
        const err = error as AxiosError<{ message?: string }>;
        const message =
            err.response?.data?.message || "Something went wrong while fetching customers";
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


export async function createCustomer(customer: CustomerSchemaType): Promise<CustomerResponse> {
    try {
        const response = await clientAxios.post<Customer>(
            API_CONFIG.ENDPOINTS.CUSTOMERS.CREATE,
            customer
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error("Failed to create customer", error);
        const err = error as AxiosError<{ message?: string }>;
        const message =
            err.response?.data?.message || "Something went wrong while creating customer";
        throw new Error(message);
    }
}

export async function updateCustomer(customer: CustomerSchemaType, id: string): Promise<CustomerResponse> {
    try {
        const response = await clientAxios.put<Customer>(
            API_CONFIG.ENDPOINTS.CUSTOMERS.UPDATE(id),
            customer
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error("Failed to update customer", error);
        const err = error as AxiosError<{ message?: string }>;
        const message =
            err.response?.data?.message || "Something went wrong while updating customer";
        throw new Error(message);
    }
}

export async function deleteCustomer(id: string): Promise<CustomerResponse> {
    try {
        const response = await clientAxios.delete<Customer>(
            API_CONFIG.ENDPOINTS.CUSTOMERS.DELETE(id)
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error("Failed to delete customer", error);
        const err = error as AxiosError<{ message?: string }>;
        const message =
            err.response?.data?.message || "Something went wrong while deleting customer";
        throw new Error(message);
    }
}
