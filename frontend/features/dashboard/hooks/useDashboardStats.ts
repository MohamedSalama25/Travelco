"use client";

import { clientAxios } from "@/lib/api/axios";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
    totalTickets: {
        value: number;
        previous: number;
        change: number;
        percentage: number;
        trend: 'increase' | 'decrease';
    };
    totalPayments: {
        value: number;
        previous: number;
        change: number;
        percentage: number;
        trend: 'increase' | 'decrease';
    };
    totalProfit: {
        value: number;
        previous: number;
        change: number;
        percentage: number;
        trend: 'increase' | 'decrease';
    };
    overdueTickets: {
        value: number;
        previous: number;
        change: number;
        percentage: number;
        trend: 'increase' | 'decrease';
    };
    latestTransfers: any[];
    monthlyStats: {
        month: number;
        ticketsCount: number;
        totalSales: number;
        totalCost: number;
        totalProfit: number;
        totalPaid: number;
    }[];
    dailyStats: {
        _id: string; // Date "YYYY-MM-DD"
        ticketsCount: number;
    }[];
}

export function useDashboardStats() {
    return useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const response = await clientAxios.get<{ success: boolean; data: DashboardStats }>("/dashboard/stats");
            return response.data;
        },
    });
}
