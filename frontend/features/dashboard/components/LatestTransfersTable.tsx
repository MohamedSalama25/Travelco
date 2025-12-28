
"use client";

import React, { useMemo } from "react";
import UniTable from "@/components/data-table";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Traveler } from "@/features/travelers/types/types";
import { useRouter } from "next/navigation";

export default function LatestTransfersTable({ data }: { data: any[] }) {
    const t = useTranslations('travelers');
    const router = useRouter();

    const handleView = (traveler: Traveler) => {
        router.push(`/travelers/${traveler._id}`);
    };

    const columns = useMemo(() => [
        {
            accessorKey: "booking_number",
            header: t("bookingNumber"),
            cell: ({ row }: any) => <span className="font-medium">{row.original.booking_number}</span>
        },
        {
            accessorKey: "customer.name",
            header: t("customer"),
        },
        {
            accessorKey: "air_comp.name",
            header: t("airCompany"),
        },
        {
            accessorKey: "ticket_price",
            header: t("ticketPrice"),
            cell: ({ row }: any) => <span>{row.original.ticket_price?.toLocaleString() ?? 0}</span>
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
        {
            accessorKey: "take_off_date",
            header: t("takeOffDate"),
            cell: ({ row }: any) => <span>{row.original.take_off_date ? format(new Date(row.original.take_off_date), "dd/MM/yyyy") : "-"}</span>
        }

    ], [t]);

    const actions = useMemo(() => [
        {
            label: "تفاصيل",
            onClick: handleView,
        },

    ], [handleView]);

    return (
        <section className="w-full">
            <header className="mb-4 px-2">
                <h2 className="text-lg font-semibold">{t("latestTickets") || "Latest Tickets"}</h2>
            </header>
            <UniTable
                columns={columns}
                data={data || []}
                totalItems={data?.length || 0}
                itemsPerPage={5}
                currentPage={1}
                tableName={t("latestTickets") || "Latest Tickets"}
                onPageChange={() => { }}
                hidePagination={true}
                actions={actions}
            />
        </section>
    );
}
