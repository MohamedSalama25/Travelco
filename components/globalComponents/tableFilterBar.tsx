"use client";

import { Filter, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export interface TableFilters {
    search: string;
    name: string;
    dateFrom: string;
    dateTo: string;
    status: string;
}

interface TableFilterBarProps {
    filters: TableFilters;
    onFiltersChange: (filters: TableFilters) => void;
    onClearFilters: () => void;
    statusOptions?: { value: string; label: string }[];
}

export default function TableFilterBar({
    filters,
    onFiltersChange,
    onClearFilters,
    statusOptions = [],
}: TableFilterBarProps) {
    const t = useTranslations("table");
    const tTravelers = useTranslations("travelers");

    const hasActiveFilters =
        filters.search ||
        filters.name ||
        filters.dateFrom ||
        filters.dateTo ||
        filters.status;

    const handleFilterChange = (key: keyof TableFilters, value: string) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-6 mt-6">
            {/* Search Input */}
            {/* <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t("search")}
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-9"
                />
            </div> */}

            {/* Filter Popover */}
            <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            {t("filters")}

                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                        <div className="space-y-4">
                            <div className="space-y-2">

                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-sm">{t("filters")}</h4>
                                    {hasActiveFilters && (
                                        <Button
                                            className="cursor-pointer"
                                            variant="ghost"
                                            size="icon"
                                            onClick={onClearFilters}
                                            title={t("clearFilters")}
                                        >
                                            <RefreshCcw className="h-4 w-4 " />
                                        </Button>
                                    )}
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    {t("applyFilters")}
                                </p>
                            </div>

                            {/* Name Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="name-filter" className="text-xs">
                                    {t("filterByName")}
                                </Label>
                                <Input
                                    id="name-filter"
                                    placeholder={tTravelers("name")}
                                    value={filters.name}
                                    onChange={(e) =>
                                        handleFilterChange("name", e.target.value)
                                    }
                                />
                            </div>

                            {/* Date Range Filter */}
                            <div className="space-y-2">
                                <Label className="text-xs">{t("filterByDate")}</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="date-from" className="text-xs text-muted-foreground">
                                            {t("from")}
                                        </Label>
                                        <Input
                                            id="date-from"
                                            type="date"
                                            value={filters.dateFrom}
                                            onChange={(e) =>
                                                handleFilterChange("dateFrom", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="date-to" className="text-xs text-muted-foreground">
                                            {t("to")}
                                        </Label>
                                        <Input
                                            id="date-to"
                                            type="date"
                                            value={filters.dateTo}
                                            onChange={(e) =>
                                                handleFilterChange("dateTo", e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status Filter */}
                            {statusOptions.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="status-filter" className="text-xs">
                                        {t("filterByStatus")}
                                    </Label>
                                    <Select
                                        value={filters.status}
                                        onValueChange={(value) =>
                                            handleFilterChange("status", value)
                                        }
                                    >
                                        <SelectTrigger id="status-filter">
                                            <SelectValue placeholder={t("selectStatus")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t("allStatuses")}</SelectItem>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Clear Filters Button */}
                {/* {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClearFilters}
                        title={t("clearFilters")}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )} */}
            </div>
        </div>
    );
}
