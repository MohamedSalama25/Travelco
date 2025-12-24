import { clientAxios } from "@/lib/api/axios";
import { ExpenseFilters, ExpenseResponse } from "../types/types";

// Note: Ensure API_CONFIG is updated with EXPENSES endpoint
const EXPENSES_ENDPOINT = 'expenses'; 

export async function getExpenses(filters: ExpenseFilters = {}): Promise<ExpenseResponse> {
    try {
        const query = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, String(value));
            }
        });

        const response = await clientAxios.get(`${EXPENSES_ENDPOINT}?${query.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch expenses", error);
        throw error;
    }
}

export async function addExpense(data: any) {
    try {
        const response = await clientAxios.post(EXPENSES_ENDPOINT, data);
        return response.data;
    } catch (error) {
        console.error("Failed to add expense", error);
        throw error;
    }
}

export async function updateExpense(id: string, data: any) {
    try {
        const response = await clientAxios.put(`${EXPENSES_ENDPOINT}/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Failed to update expense", error);
        throw error;
    }
}

export async function deleteExpense(id: string) {
    try {
        const response = await clientAxios.delete(`${EXPENSES_ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to delete expense", error);
        throw error;
    }
}
