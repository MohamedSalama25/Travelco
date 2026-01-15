import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { Traveler, Pagination } from "../types/types";
import UniTable from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Filter, Archive, FileDown, Loader, MessageCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { deleteTraveler, exportTravelersToExcel } from "../services/travelerService";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { TravelersFilterPopover } from "./TravelersFilterPopover";


interface TravelersTableProps {
    data: Traveler[];
    pagination: Pagination;
    onPageChange: (page: number) => void;
    isLoading: boolean;
    filters: {
        bookingNumber: string;
        name: string;
        status: string;
        fromDate?: string;
        toDate?: string;
        createdAt?: string;
    };
    onFilterChange: (filters: { bookingNumber: string; name: string; status: string; fromDate?: string; toDate?: string; createdAt?: string }) => void;
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

    const handleDateRangeChange = (from: string, to: string) => {
        onFilterChange({ ...filters, fromDate: from, toDate: to });
    };

    const handleCreatedAtChange = (value: string) => {
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
            icon: <Trash2 className="w-12 h-12 text-red-500 mb-4" />,
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
                    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
                    queryClient.invalidateQueries({
                        queryKey: ["travelers-stats"],
                    });
                }
            } catch (error: any) {
                showErrorToast(error.response?.data?.message || "فشل حذف المسافر");
            }
        }
    };

    const [isExporting, setIsExporting] = useState(false);

    const handleExportExcel = async () => {
        try {
            setIsExporting(true);
            await exportTravelersToExcel(filters);
            showSuccessToast("تم تصدير البيانات بنجاح");
        } catch (error) {
            showErrorToast("فشل تصدير البيانات");
        } finally {
            setIsExporting(false);
        }
    };

    const handleWhatsAppAlert = (traveler: Traveler) => {
        if (!traveler.customer?.phone) {
            showErrorToast("رقم الهاتف غير متاح");
            return;
        }
        
        const phone = traveler.customer.phone.replace(/\D/g, "");
        const dateStr = traveler.take_off_date ? format(new Date(traveler.take_off_date), "dd/MM/yyyy HH:mm") : "";
        const message = `مرحباً ${traveler.customer.name}، نود تذكيركم بموعد رحلتكم رقم الحجز ${traveler.booking_number} بتاريخ ${dateStr}. نتمنى لكم رحلة سعيدة.`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
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
            accessorKey: "take_off_date",
            header: t("takeOffDate"),
            cell: ({ row }) => {
                const date = row.original.take_off_date ? new Date(row.original.take_off_date) : null;
                return (
                    <div className="flex flex-col">
                        <span>{date ? format(date, "dd/MM/yyyy") : "-"}</span>
                        {date && <span className="text-xs text-muted-foreground">{format(date, "HH:mm")}</span>}
                    </div>
                );
            }
        },

        {
            accessorKey: "ticket_price",
            header: t("ticketPrice"),
            cell: ({ row }) => <span className="text-green-600 font-bold">{row.original.ticket_price.toLocaleString("en-US")} ج.م</span>
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
                        row.original.status === 'paid' ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                            row.original.status === 'partial' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' :
                                'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                    }
                >
                    {t(row.original.status)}
                </Badge>
            )
        },
    ], [t]);

    const actions = useMemo(() => [
        {
            label: tTable("details"),
            onClick: handleView,
        },
        {
            label: "تنبيه WhatsApp",
            icon: MessageCircle,
            onClick: handleWhatsAppAlert,
            show: (traveler: Traveler) => {
                if (!traveler.take_off_date) return false;
                const takeoff = new Date(traveler.take_off_date).getTime();
                const now = new Date().getTime();
                const diff = takeoff - now;
                const twentyFourHours = 24 * 60 * 60 * 1000;
                return diff > 0 && diff <= twentyFourHours;
            }
        },
        {
            label: tTable("edit"),
            onClick: handleEdit,
        },
        {
            label: tTable("delete"),
            onClick: handleDelete,
        },
    ], [handleEdit, handleDelete, handleView, tTable]);

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
                        handleDateRangeChange={handleDateRangeChange}
                        handleCreatedAtChange={handleCreatedAtChange}
                        onFilterChange={onFilterChange}
                    />
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
