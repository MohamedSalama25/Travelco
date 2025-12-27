"use client";

import { useState, useMemo } from "react";
import UniTable from "@/components/data-table";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useRouter, Link } from "@/routing";
import { useTranslations, useLocale } from "next-intl";
import { useCustomer } from "../hooks/useCustomers";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const CustomerDetails = () => {
    const params = useParams();
    const t = useTranslations("customers");
    const router = useRouter();
    const locale = useLocale();
    const id = params.id as string;
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useCustomer(id, page);

    // Define columns first (unconditionally)
    const columns = useMemo(() => [
        {
            accessorKey: "booking_number",
            header: t("bookingNumber"),
            cell: ({ row }: any) => <span className="font-medium">{row.original.booking_number}</span>
        },
        {
            accessorKey: "air_comp.name",
            header: t("airCompany"),
        },
        {
            accessorKey: "country",
            header: t("country"),
        },
        {
            accessorKey: "ticket_price",
            header: t("ticketPrice"),
            cell: ({ row }: any) => <span>{row.original.ticket_price?.toLocaleString() ?? 0} ج.م</span>
        },
        {
            accessorKey: "total_paid",
            header: t("paid"),
            cell: ({ row }: any) => <span className="text-green-600 font-medium">{row.original.total_paid?.toLocaleString() ?? 0} ج.م</span>
        },
        {
            accessorKey: "remaining_amount",
            header: t("remaining"),
            cell: ({ row }: any) => <span className="text-red-600 font-medium">{row.original.remaining_amount?.toLocaleString() ?? 0} ج.م</span>
        },
        {
            accessorKey: "status",
            header: t("status"),
            cell: ({ row }: any) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.original.status === 'paid' ? 'bg-green-100 text-green-800' :
                    row.original.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {t(row.original.status)}
                </span>
            )
        },
    ], [t]);

    const handleRowClick = (row: any) => {
        router.push(`/travelers/${row._id}`);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">{t("loading")}</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <p className="text-red-500">{t("loadError")}</p>
                </div>
            </div>
        );
    }

    const { customer, transfers, stats } = data.data;
    const pagination = data.pagination || { total: 0, limit: 10 };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{customer.name}</h1>
                    <p className="text-muted-foreground">{t("customerDetails")}</p>
                </div>
                <Link href="/customers">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                        {t("back")}
                    </Button>
                </Link>
            </div>

            {/* Customer Info Card */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="border rounded-lg p-6 space-y-4">
                    <h2 className="text-xl font-semibold">{t("information")}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">{t("email")}</p>
                            <p className="font-medium">{customer.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("phone")}</p>
                            <p className="font-medium">{customer.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("passportNumber")}</p>
                            <p className="font-medium">{customer.passport_number}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("nationality")}</p>
                            <p className="font-medium">{customer.nationality}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">{t("address")}</p>
                            <p className="font-medium">{customer.address}</p>
                        </div>
                    </div>
                </div>

                {/* Statistics Card */}
                <div className="border rounded-lg p-6 space-y-4">
                    <h2 className="text-xl font-semibold">{t("statistics")}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">{t("totalTickets")}</p>
                            <p className="text-2xl font-bold">{stats.totalTickets}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("totalAmount")}</p>
                            <p className="text-2xl font-bold">{stats.totalAmount.toLocaleString()} ج.م</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("totalPaid")}</p>
                            <p className="text-2xl font-bold text-green-600">{stats.totalPaid.toLocaleString()} ج.م</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("totalRemaining")}</p>
                            <p className="text-2xl font-bold text-red-600">{stats.totalRemaining.toLocaleString()} ج.م</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transfers Table */}
            <div className="border rounded-lg overflow-hidden">
                <div className="p-6 border-b bg-card">
                    <h2 className="text-xl font-semibold">{t("transfers")}</h2>
                </div>
                <UniTable
                    columns={columns}
                    data={transfers}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    currentPage={page}
                    onPageChange={setPage}
                    tableName={t("transfers")}
                    onRowClick={handleRowClick}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};