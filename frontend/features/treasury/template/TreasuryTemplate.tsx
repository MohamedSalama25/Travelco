'use client';

import { useState } from "react";
import { TreasuryStats } from "../components/TreasuryStats";
import { TreasuryFilters } from "../components/TreasuryFilters";
import { TreasuryTable } from "../components/TreasuryTable";
import { TreasuryFilters as TreasuryFiltersType } from "../types/types";
import { useTreasuryHistory, useTreasuryStats, useTreasuryMutation } from "../hooks/useTreasury";
import { useTranslations } from "next-intl";
import { exportTreasuryToExcel } from "../services/treasuryService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import TreasuryActionDialog from "../components/TreasuryActionDialog";

export const TreasuryTemplate = () => {
    const t = useTranslations('treasury');
    const [filters, setFilters] = useState<TreasuryFiltersType>({
        page: 1,
        limit: 10
    });
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'in' | 'out'>('in');

    const { data: historyData, isLoading: historyLoading, isError, error } = useTreasuryHistory(filters);
    const { data: statsData } = useTreasuryStats({ fromDate: filters.fromDate, toDate: filters.toDate });
    const { mutateAsync: createTransaction, isPending: isSubmitting } = useTreasuryMutation();

    const handleExport = async () => {
        try {
            await exportTreasuryToExcel(filters);
            toast.success(t('exportSuccess') || 'Data exported successfully');
        } catch (error) {
            toast.error(t('exportError') || 'Failed to export data');
        }
    };

    const handleOpenAction = (type: 'in' | 'out') => {
        setActionType(type);
        setActionDialogOpen(true);
    };

    const handleSubmitAction = async (data: { type: 'in' | 'out', amount: number, description: string }) => {
        try {
            await createTransaction(data);
            toast.success(t('transactionSuccess') || 'Transaction added successfully');
            setActionDialogOpen(false);
        } catch (error) {
            toast.error(t('transactionError') || 'Failed to add transaction');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">{t('treasuryManagement')}</h1>
                <div className="flex gap-2">
                    <Button onClick={() => handleOpenAction('in')} className="gap-2 bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4" />
                        {t('deposit')}
                    </Button>
                    <Button onClick={() => handleOpenAction('out')} className="gap-2 bg-red-600 hover:bg-red-700">
                        <Minus className="h-4 w-4" />
                        {t('withdraw')}
                    </Button>
                </div>
            </div>

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
                isError={isError}
                error={error}
            />

            <TreasuryActionDialog
                isOpen={actionDialogOpen}
                onClose={() => setActionDialogOpen(false)}
                type={actionType}
                onSubmit={handleSubmitAction}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};
