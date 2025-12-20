import { useQuery } from "@tanstack/react-query";
import { getTreasuryHistory, getTreasuryStats } from "../services/treasuryService";
import { TreasuryFilters } from "../types/types";

export const useTreasuryHistory = (filters: TreasuryFilters) => {
    return useQuery({
        queryKey: ['treasury-history', filters],
        queryFn: () => getTreasuryHistory(filters),
    });
};

export const useTreasuryStats = (filters: { fromDate?: string; toDate?: string }) => {
    return useQuery({
        queryKey: ['treasury-stats', filters],
        queryFn: () => getTreasuryStats(filters),
    });
};
