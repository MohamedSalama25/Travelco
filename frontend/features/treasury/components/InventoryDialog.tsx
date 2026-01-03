'use client';

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { useInventory } from "../hooks/useTreasury";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Briefcase,
    Loader2,
    Calendar as CalendarIcon
} from "lucide-react";
import {
    startOfMonth,
    startOfYear,
    format
} from "date-fns";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface InventoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const InventoryDialog = ({ isOpen, onClose }: InventoryDialogProps) => {
    const t = useTranslations('treasury');
    const tCommon = useTranslations('common');

    const [filterType, setFilterType] = useState<string>("custom");
    const [fromDate, setFromDate] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

    const handleFilterTypeChange = (value: string) => {
        setFilterType(value);
        const today = new Date();

        if (value === "thisMonth") {
            setFromDate(format(startOfMonth(today), 'yyyy-MM-dd'));
            setToDate(format(today, 'yyyy-MM-dd'));
        } else if (value === "thisYear") {
            setFromDate(format(startOfYear(today), 'yyyy-MM-dd'));
            setToDate(format(today, 'yyyy-MM-dd'));
        }
    };

    const { data: inventoryData, isLoading, isFetching } = useInventory({ fromDate, toDate });

    const stats = inventoryData?.data || {
        totalRevenue: 0,
        totalExpenses: 0,
        totalProfit: 0,
        netProfit: 0
    };

    const statCards = [
        // {
        //     title: t('revenue'),
        //     value: stats.totalRevenue,
        //     icon: <Briefcase className="h-5 w-5 text-blue-600" />,
        //     color: "text-blue-600",
        //     bgColor: "bg-blue-50 dark:bg-blue-950/30"
        // },
        {
            title: t('expense'),
            value: stats.totalExpenses,
            icon: <TrendingDown className="h-5 w-5 text-red-600" />,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-950/30"
        },
        {
            title: t('totalProfit'),
            value: stats.totalProfit,
            icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50 dark:bg-emerald-950/30"
        },
        {
            title: t('netProfit'),
            value: stats.netProfit,
            icon: <DollarSign className="h-5 w-5 text-purple-600" />,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950/30"
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl sm:max-w-[800px] gap-6">
                <DialogHeader className="pr-8">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            <Calculator className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-xl truncate">{t('inventory')}</DialogTitle>
                            <DialogDescription className="truncate">
                                {tCommon('specificDate')}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
                    <div className="flex flex-col gap-2">
                        <Label>{t('filterRange')}</Label>
                        <Select value={filterType} onValueChange={handleFilterTypeChange}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder={t('selectRange')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="thisMonth">{t('thisMonth')}</SelectItem>
                                <SelectItem value="thisYear">{t('thisYear')}</SelectItem>
                                <SelectItem value="custom">{t('customRange')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {filterType === "custom" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-dashed border-muted-foreground/20">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-xs font-normal">
                                    <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                    {tCommon('fromDate')}
                                </Label>
                                <Input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="bg-background h-9"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-xs font-normal">
                                    <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                    {tCommon('toDate')}
                                </Label>
                                <Input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="bg-background h-9"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative">
                    {(isLoading || isFetching) && (
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {statCards.map((stat, index) => (
                            <Card key={index} className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                                        {stat.icon}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className={cn("text-2xl font-bold", stat.color)}>
                                        {stat.value.toLocaleString()}
                                        <span className="text-xs font-normal text-muted-foreground mr-1">ج.م</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-2">
                    <Button variant="outline" onClick={onClose}>
                        {tCommon('back')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InventoryDialog;
