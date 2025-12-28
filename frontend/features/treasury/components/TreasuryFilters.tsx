'use client';
import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/globalComponents/date-picker";
import { formatDateToLocal } from "@/lib/dateUtils";
import { TreasuryFilters as TreasuryFiltersType } from "../types/types";
import { useTranslations } from "next-intl";
import { FileDown, Loader, RefreshCcw, X } from "lucide-react";

interface TreasuryFiltersProps {
    filters: TreasuryFiltersType;
    onFilterChange: (filters: TreasuryFiltersType) => void;
    onExport: () => void;
}

export const TreasuryFilters = ({ filters, onFilterChange, onExport }: TreasuryFiltersProps) => {
    const t = useTranslations('treasury');
    const tCommon = useTranslations('common');
    const [isExporting, setIsExporting] = useState(false);

    const handleExportExcel = async () => {
        try {
            setIsExporting(true);
            await onExport();
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="bg-card p-4 rounded-lg border flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                <div className="space-y-2">
                    <Label>{tCommon('fromDate')}</Label>
                    <DatePicker
                        value={filters.fromDate ? new Date(filters.fromDate) : undefined}
                        onChange={(date) => onFilterChange({ ...filters, fromDate: date ? formatDateToLocal(date) : "", page: 1 })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>{tCommon('toDate')}</Label>
                    <DatePicker
                        value={filters.toDate ? new Date(filters.toDate) : undefined}
                        onChange={(date) => onFilterChange({ ...filters, toDate: date ? formatDateToLocal(date) : "", page: 1 })}
                    />
                </div>
                <div className="flex gap-4 px-2">
                    <div className="space-y-2">
                        <Label>{t('type')}</Label>
                        <Select
                            value={filters.type || 'all'}
                            onValueChange={(value) => onFilterChange({ ...filters, type: value === 'all' ? undefined : value as any, page: 1 })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('allTypes')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{tCommon('all')}</SelectItem>
                                <SelectItem value="in">{t('income')}</SelectItem>
                                <SelectItem value="out">{t('expense')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>المصدر</Label>
                        <Select
                            value={filters.relatedModel || 'all'}
                            onValueChange={(value) => onFilterChange({ ...filters, relatedModel: value === 'all' ? undefined : value, page: 1 })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('allSources')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{tCommon('all')}</SelectItem>
                                <SelectItem value="Transfer">{t('transfer')}</SelectItem>
                                <SelectItem value="Payment">{t('payment')}</SelectItem>
                                <SelectItem value="Expense">{t('expense_source')}</SelectItem>
                                <SelectItem value="Other">{t('other')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <Button
                    className="gap-1 bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                    onClick={() => onFilterChange({
                        page: 1,
                        limit: filters.limit,
                        fromDate: "",
                        toDate: "",
                        type: undefined,
                        relatedModel: undefined
                    })}
                >
                    <RefreshCcw className="h-4 w-4" />
                    {tCommon('clearFilters') || 'مسح الفلاتر'}
                </Button>
                <Button
                    variant="outline"
                    className="gap-2 text-green-600 hover:bg-green-50"
                    onClick={handleExportExcel}
                    disabled={isExporting}
                >
                    <FileDown className="h-4 w-4" />

                    {isExporting ? (
                        <>
                            جاري التصدير
                            <Loader className="h-4 w-4 animate-spin ml-2" />
                        </>
                    ) : (
                        "تصدير Excel"
                    )}
                </Button>
            </div>
        </div>
    );
};
