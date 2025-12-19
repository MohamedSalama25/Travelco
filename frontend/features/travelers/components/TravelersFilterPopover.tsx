"use client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";
export function TravelersFilterPopover({
    filters,
    handleNameChange,
    handleStatusChange,
    handleDateRangeChange,
    handleCreatedAtChange,
    onFilterChange,
}: {
    filters: {
        bookingNumber: string;
        name: string;
        status: string;
        fromDate?: string;
        toDate?: string;
        createdAt?: string;
    };
    handleNameChange: (name: string) => void;
    handleStatusChange: (status: string) => void;
    handleDateRangeChange: (from: string, to: string) => void;
    handleCreatedAtChange: (date: string) => void;
    onFilterChange: (filters: {
        bookingNumber: string;
        name: string;
        status: string;
        fromDate?: string;
        toDate?: string;
        takeOffDate?: string;
    }) => void;
}) {
    const t = useTranslations("travelers");
    const tTable = useTranslations("table");
    const tGeneral = useTranslations("general");
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {tTable("filter")}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">{tTable("filters")}</h4>
                        <p className="text-sm text-muted-foreground">
                            {tTable("applyFilters")}
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{tTable("filterByName")}</Label>
                            <Input
                                id="name"
                                placeholder={tTable("filterByName")}
                                value={filters.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">{t("status")}</Label>
                            <Select value={filters.status} onValueChange={handleStatusChange}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder={t("status")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{tTable("allStatuses")}</SelectItem>
                                    <SelectItem value="paid">{t("paid")}</SelectItem>
                                    <SelectItem value="partial">{t("partial")}</SelectItem>
                                    <SelectItem value="unpaid">{t("unpaid")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="createdAt">{t("createdAt")}</Label>
                            <Input
                                id="createdAt"
                                type="date"
                                value={filters.createdAt || ''}
                                onChange={(e) => handleCreatedAtChange(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>{t("createdAt")}</Label>
                            <div className="flex gap-2">
                                <div className="grid gap-1 flex-1">
                                    <Label htmlFor="fromDate" className="text-xs text-muted-foreground">{tGeneral("from")}</Label>
                                    <Input
                                        id="fromDate"
                                        type="date"
                                        value={filters.fromDate || ''}
                                        onChange={(e) => handleDateRangeChange(e.target.value, filters.toDate || '')}
                                    />
                                </div>
                                <div className="grid gap-1 flex-1">
                                    <Label htmlFor="toDate" className="text-xs text-muted-foreground">{tGeneral("to")}</Label>
                                    <Input
                                        id="toDate"
                                        type="date"
                                        value={filters.toDate || ''}
                                        onChange={(e) => handleDateRangeChange(filters.fromDate || '', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full mt-2"
                            onClick={() => onFilterChange({
                                bookingNumber: filters.bookingNumber,
                                name: "",
                                status: "all",
                                fromDate: "",
                                toDate: "",
                                takeOffDate: ""
                            })}
                        >
                            {tTable("clearFilters")}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
