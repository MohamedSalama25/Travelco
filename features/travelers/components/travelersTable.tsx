import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { Traveler, Pagination } from "../types/types";
import UniTable from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { Search, Filter, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { deleteTraveler } from "../services/travelerService";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import { TravelersFilterPopover } from "./travelersFilterPopover";


interface TravelersTableProps {
    data: Traveler[];
    pagination: Pagination;
    onPageChange: (page: number) => void;
    isLoading: boolean;
    filters: {
        bookingNumber: string;
        name: string;
        status: string;
        createdAt?: string;
    };
    onFilterChange: (filters: { bookingNumber: string; name: string; status: string; createdAt?: string }) => void;
    onEdit?: (traveler: Traveler) => void;
    handleCreate?: () => void;
}

export function TravelersTable({
    data,
    pagination,
    onPageChange,
    isLoading,
    filters,
    onFilterChange,
    handleCreate,
    onEdit
}: TravelersTableProps) {
    const t = useTranslations("travelers");
    const tTable = useTranslations("table");
    const tGeneral = useTranslations("general");
    const queryClient = useQueryClient();
    const router = useRouter();
    const { confirm } = useConfirm();

    const handleBookingNumberChange = (value: string) => {
        onFilterChange({ ...filters, bookingNumber: value });
    };

    const handleNameChange = (value: string) => {
        onFilterChange({ ...filters, name: value });
    };

    const handleStatusChange = (value: string) => {
        onFilterChange({ ...filters, status: value });
    };

    const handleDateChange = (value: string) => {
        onFilterChange({ ...filters, createdAt: value });
    };

    const handleView = (traveler: Traveler) => {
        router.push(`/travelers/${traveler._id}`);
    };

    const handleEdit = (traveler: Traveler) => {
        // router.push(`/travelers/${traveler._id}/edit`);
        if (onEdit) {
            onEdit(traveler);
        }
    };

    const handleDelete = async (traveler: Traveler) => {
        const confirmed = await confirm({
            title: tTable("confirmDelete"),
            description: tTable("confirmPermanentDelete"),
            confirmText: tTable("delete"),
            cancelText: tGeneral("cancel"),
            variant: "destructive",
        });

        if (confirmed) {
            try {
                const res = await deleteTraveler(traveler._id);
                if (res.success) {
                    showSuccessToast(res.message);
                    queryClient.invalidateQueries({
                        queryKey: ["travelers"],
                    });
                    queryClient.invalidateQueries({
                        queryKey: ["travelers-stats"],
                    });
                }
            } catch (error) {
                showErrorToast("traveler deleted failed!!");
            }
        }
    };

    const columns: ColumnDef<Traveler>[] = useMemo(() => [
        {
            accessorKey: "booking_number",
            header: t("bookingNumber"),
        },

        {
            accessorKey: "customer.name",
            header: t("customer"),
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.customer?.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.customer?.phone}</span>
                </div>
            )
        },

        {
            accessorKey: "ticket_price",
            header: t("ticketPrice"),
            cell: ({ row }) => <span className="text-green-600">{row.original.ticket_price.toLocaleString()} EGP</span>
        },
        {
            accessorKey: "total_paid",
            header: t("totalPaid"),
            cell: ({ row }) => <span className="text-green-600">{row.original.total_paid.toLocaleString() || 0} EGP</span>
        },

        {
            accessorKey: "status",
            header: t("status"),
            cell: ({ row }) => (
                <Badge variant={
                    row.original.status === 'paid' ? 'default' :
                        row.original.status === 'partial' ? 'secondary' :
                            'destructive'
                }
                    className={
                        row.original.status === 'paid' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                            row.original.status === 'partial' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                                'bg-red-100 text-red-800 hover:bg-red-100'
                    }
                >
                    {t(row.original.status)}
                </Badge>
            )
        },

        {
            accessorKey: "createdAt",
            header: t("createdAt"),
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.createdAt.toLocaleString()}</span>
        },

    ], [t]);

    const actions = useMemo(() => [
        {
            label: "View",
            onClick: handleView,
        },
        {
            label: "Edit",
            onClick: handleEdit,
        },
        {
            label: "Delete",
            onClick: handleDelete,
        },
    ], [handleEdit, handleDelete, handleView]);

    return (
        <div className="space-y-4">
            <div className="flex gap-3 items-center bg-card px-3 rounded-xl justify-between py-3 flex-wrap">
                <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <div className="relative w-75  max-w-[500px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t("searchBookingNumber")}
                            value={filters.bookingNumber}
                            onChange={(e) => handleBookingNumberChange(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <TravelersFilterPopover
                        filters={filters}
                        handleNameChange={handleNameChange}
                        handleStatusChange={handleStatusChange}
                        handleDateChange={handleDateChange}
                        onFilterChange={onFilterChange}
                    />
                    <Button variant="outline" className="gap-2 text-destructive hover:bg-destructive/10">
                        <Archive className="h-4 w-4" />
                        {tTable("archive")}
                    </Button>

                    <Button onClick={handleCreate}>{t("addTicket")}</Button>
                </div>
            </div>

            <UniTable<Traveler>
                columns={columns}
                data={data}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                currentPage={pagination.page}
                tableName={t("totalTravelers")}
                onPageChange={onPageChange}
                isLoading={isLoading}
                actions={actions}
            />
        </div>
    );
}
