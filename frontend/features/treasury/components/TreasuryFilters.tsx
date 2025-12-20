'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TreasuryFilters as TreasuryFiltersType } from "../types/types";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";

interface TreasuryFiltersProps {
    filters: TreasuryFiltersType;
    onFilterChange: (filters: TreasuryFiltersType) => void;
    onExport: () => void;
}

export const TreasuryFilters = ({ filters, onFilterChange, onExport }: TreasuryFiltersProps) => {
    const t = useTranslations('treasury');
    const tCommon = useTranslations('common');

    return (
        <div className="bg-card p-4 rounded-lg border flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                <div className="space-y-2">
                    <Label>{tCommon('fromDate')}</Label>
                    <Input
                        type="date"
                        value={filters.fromDate || ''}
                        onChange={(e) => onFilterChange({ ...filters, fromDate: e.target.value, page: 1 })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>{tCommon('toDate')}</Label>
                    <Input
                        type="date"
                        value={filters.toDate || ''}
                        onChange={(e) => onFilterChange({ ...filters, toDate: e.target.value, page: 1 })}
                    />
                </div>
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
                    <Label>{t('relatedModel')}</Label>
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
            <div className="flex gap-2">
                <Button variant="outline" onClick={onExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    {tCommon('exportExcel')}
                </Button>
            </div>
        </div>
    );
};
