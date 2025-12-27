
"use client";

import React, { useMemo } from "react";
import UniTable from "@/components/data-table";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function LatestTransfersTable({ data }: { data: any[] }) {
    const t = useTranslations('travelers');

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
            accessorKey: "take_off_date",
            header: t("takeOffDate"),
            cell: ({ row }: any) => <span>{row.original.take_off_date ? format(new Date(row.original.take_off_date), "dd/MM/yyyy") : "-"}</span>
        },
        {
            accessorKey: "status",
            header: t("status"),
            cell: ({ row }: any) => (
                <Badge variant={row.original.status === "paid" ? "default" : row.original.status === "cancel" ? "destructive" : "outline"}>
                    {t(row.original.status)}
                </Badge>
            )
        },
        {
            accessorKey: "ticket_price",
            header: t("ticketPrice"),
            cell: ({ row }: any) => <span>{row.original.ticket_price?.toLocaleString() ?? 0}</span>
        },
    ], [t]);

    return (
        <section className="w-full">
            <header className="mb-4">
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
            />
        </section>
    );
}
