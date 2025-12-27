"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UniTable from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    ArrowRight,
    Wallet,
    Calendar,
    Ticket,
    TrendingUp,
    Plus,
} from "lucide-react";
import { useAirCompDetails } from "../hooks/useAirComps";
import AirCompPaymentDialog from "../components/AirCompPaymentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { FullScreenLoader } from "@/components/globalComponents/FullScreenLoader";
import Error from "@/components/globalComponents/Error";

export default function AirCompDetailsTemplate({ id }: { id: string }) {
    const t = useTranslations("airComps");
    const tTravelers = useTranslations("travelers");
    const tCommon = useTranslations("common");
    const router = useRouter();
    const locale = useLocale();
    const [ticketsPage, setTicketsPage] = useState(1);
    const [paymentsPage, setPaymentsPage] = useState(1);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    const { data: response, isLoading, isError } = useAirCompDetails(id, ticketsPage, paymentsPage);

    const ticketsColumns = useMemo(() => [
        {
            accessorKey: "booking_number",
            header: tTravelers("bookingNumber"),
            cell: ({ row }: any) => <span className="font-medium">{row.original.booking_number}</span>
        },
        {
            accessorKey: "customer.name",
            header: tTravelers("customer"),
        },
        {
            accessorKey: "take_off_date",
            header: tTravelers("takeOffDate"),
            cell: ({ row }: any) => <span>{row.original.take_off_date ? format(new Date(row.original.take_off_date), "dd/MM/yyyy") : "-"}</span>
        },
        {
            accessorKey: "ticket_salary",
            header: tTravelers("ticketSalary"),
            cell: ({ row }: any) => <span>{row.original.ticket_salary?.toLocaleString() ?? 0} ج.م</span>
        },
        {
            accessorKey: "status",
            header: tTravelers("status"),
            cell: ({ row }: any) => (
                <Badge variant={row.original.status === "paid" ? "default" : row.original.status === "cancel" ? "destructive" : "outline"}>
                    {tTravelers(row.original.status)}
                </Badge>
            )
        },
    ], [tTravelers]);

    const paymentsColumns = useMemo(() => [
        {
            accessorKey: "payment_date",
            header: t("date"),
            cell: ({ row }: any) => <span>{format(new Date(row.original.payment_date), "dd/MM/yyyy")}</span>
        },
        {
            accessorKey: "amount",
            header: t("amount"),
            cell: ({ row }: any) => <span className="font-bold text-green-600">{row.original.amount?.toLocaleString() ?? 0} ج.م</span>
        },
        {
            accessorKey: "payment_method",
            header: t("paymentMethod"),
            cell: ({ row }: any) => <span>{tTravelers(row.original.payment_method)}</span>
        },
        {
            accessorKey: "receipt_number",
            header: t("receiptNumber"),
        },
        {
            accessorKey: "notes",
            header: tCommon("notes"),
        },
    ], [t, tTravelers, tCommon]);


    if (isLoading) {
        return <FullScreenLoader />;
    }

    if (isError) {
        return <Error message={t('loadError')} />;
    }

    const { airComp, transfers, payments, stats } = response.data;
    const pagination = response.data.pagination || { transfers: { total: 0, limit: 10 }, payments: { total: 0, limit: 10 } };

    const handleTicketRowClick = (row: any) => {
        router.push(`/${locale}/travelers/${row._id}`);
    };

    const statCards = [
        {
            title: t("totalTickets"),
            value: stats.ticketsCount || 0,
            icon: Ticket,
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
        {
            title: t("totalPurchases"),
            value: `${stats.totalPurchases?.toLocaleString()} ج.م`,
            icon: Calendar,
            color: "text-orange-600",
            bg: "bg-orange-100",
        },
        {
            title: t("totalPaid"),
            value: `${stats.totalPaid?.toLocaleString()} ج.م`,
            icon: Wallet,
            color: "text-green-600",
            bg: "bg-green-100",
        },
        {
            title: t("remainingAmount"),
            value: `${stats.remainingAmount?.toLocaleString()} ج.م`,
            icon: TrendingUp,
            color: "text-destructive",
            bg: "bg-red-100",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 px-3">

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{airComp.name}</h1>
                        <p className="text-muted-foreground">{airComp.phone} | {airComp.address}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 ">
                    <Button onClick={() => setIsPaymentDialogOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t("addPayment")}
                    </Button>
                    <Button className="bg-gray-100 cursor-pointer hover:bg-gray-200" variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </div>


            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, idx) => (
                    <Card key={idx}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <div className={`${stat.bg} p-2 rounded-full`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="tickets" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="tickets">{t("tickets")}</TabsTrigger>
                    <TabsTrigger value="payments">{t("payments")}</TabsTrigger>
                </TabsList>

                {/* Tickets Tab */}
                <TabsContent value="tickets" className="mt-4">
                    <Card>
                        <CardContent className="pt-6">
                            <UniTable
                                columns={ticketsColumns}
                                data={transfers}
                                totalItems={pagination.transfers.total}
                                itemsPerPage={pagination.transfers.limit}
                                currentPage={ticketsPage}
                                onPageChange={setTicketsPage}
                                tableName={t("tickets")}
                                onRowClick={handleTicketRowClick}
                                isLoading={isLoading}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="mt-4">
                    <Card>
                        <CardContent className="pt-6">
                            <UniTable
                                columns={paymentsColumns}
                                data={payments}
                                totalItems={pagination.payments.total}
                                itemsPerPage={pagination.payments.limit}
                                currentPage={paymentsPage}
                                onPageChange={setPaymentsPage}
                                tableName={t("payments")}
                                isLoading={isLoading}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Payment Dialog */}
            <AirCompPaymentDialog
                isOpen={isPaymentDialogOpen}
                onClose={() => setIsPaymentDialogOpen(false)}
                airCompId={id}
                airCompName={airComp?.name}
                remainingAmount={stats?.remainingAmount}
            />
        </div>
    );
}
