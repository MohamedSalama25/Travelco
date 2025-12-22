'use client';

import { useState } from "react";
import { TreasuryStats } from "../components/TreasuryStats";
import { TreasuryFilters } from "../components/TreasuryFilters";
import { TreasuryTable } from "../components/TreasuryTable";
import { TreasuryFilters as TreasuryFiltersType } from "../types/types";
import { useTreasuryHistory, useTreasuryStats } from "../hooks/useTreasury";
import { useTranslations } from "next-intl";
import { exportTreasuryToExcel } from "../services/treasuryService";
import { toast } from "sonner";

export const TreasuryTemplate = () => {
    const t = useTranslations('treasury');
    const [filters, setFilters] = useState<TreasuryFiltersType>({
        page: 1,
        limit: 10
    });

    const { data: historyData, isLoading: historyLoading } = useTreasuryHistory(filters);
    const { data: statsData } = useTreasuryStats({ fromDate: filters.fromDate, toDate: filters.toDate });

    const handleExport = async () => {
        try {
            await exportTreasuryToExcel(filters);
            toast.success(t('exportSuccess') || 'Data exported successfully');
        } catch (error) {
            toast.error(t('exportError') || 'Failed to export data');
        }
    };

    return (
        <div className="space-y-6">

            <TreasuryStats stats={statsData?.data} />

            <TreasuryFilters
                filters={filters}
                onFilterChange={setFilters}
                onExport={handleExport}
            />

            <TreasuryTable
                data={historyData?.data || []}
                pagination={historyData?.pagination || { total: 0, page: 1, limit: 10, pages: 1 }}
                onPageChange={(page) => setFilters({ ...filters, page })}
                isLoading={historyLoading}
            />
        </div>
    );
};
