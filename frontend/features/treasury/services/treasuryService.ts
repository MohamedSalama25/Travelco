import { API_CONFIG } from "@/lib/api/config";
import { clientAxios } from "@/lib/api/axios";
import { TreasuryTransaction, TreasuryStats, TreasuryFilters } from "../types/types";

export async function getTreasuryHistory(filters: TreasuryFilters = {}) {
    try {
        const query = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, String(value));
            }
        });

        const response = await clientAxios.get(`${API_CONFIG.ENDPOINTS.TREASURY.LIST}?${query.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch treasury history", error);
        throw error;
    }
}

export async function getTreasuryStats(filters: { fromDate?: string; toDate?: string } = {}) {
    try {
        const query = new URLSearchParams();
        if (filters.fromDate) query.append('fromDate', filters.fromDate);
        if (filters.toDate) query.append('toDate', filters.toDate);

        const response = await clientAxios.get(`${API_CONFIG.ENDPOINTS.TREASURY.STATS}?${query.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch treasury stats", error);
        throw error;
    }
}

export async function exportTreasuryToExcel(filters: TreasuryFilters = {}): Promise<void> {
    try {
        const query = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, String(value));
            }
        });

        const response = await clientAxios.get(`${API_CONFIG.ENDPOINTS.TREASURY.EXPORT_EXCEL}?${query.toString()}`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `treasury_history_${Date.now()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Failed to export treasury data", error);
        throw error;
    }
}
export async function addTransaction(data: { type: 'in' | 'out', amount: number, description: string }) {
    try {
        const response = await clientAxios.post(API_CONFIG.ENDPOINTS.TREASURY.TRANSACTIONS, data);
        return response.data;
    } catch (error) {
        console.error("Failed to add transaction", error);
        throw error;
    }
}
