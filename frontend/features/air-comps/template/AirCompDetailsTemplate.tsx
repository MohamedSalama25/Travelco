"use client";

import { useState } from "react";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    const [page, setPage] = useState(1);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    const { data: response, isLoading, isError } = useAirCompDetails(id, page);

    if (isLoading) {
        return <FullScreenLoader />;
    }

    if (isError) {
        return <Error message={t('loadError')} />;
    }

    const { airComp, transfers, payments, stats, pagination } = response.data;

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
                        <CardHeader>
                            <CardDescription>{transfers.length === 0 ? t("noTickets") : ""}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">{tTravelers("bookingNumber")}</TableHead>
                                        <TableHead className="text-right">{tTravelers("customer")}</TableHead>
                                        <TableHead className="text-right">{tTravelers("takeOffDate")}</TableHead>
                                        <TableHead className="text-right">{tTravelers("ticketSalary")}</TableHead>
                                        <TableHead className="text-right">{tTravelers("status")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transfers.map((ticket: any) => (
                                        <TableRow key={ticket._id} className="cursor-pointer" onClick={() => router.push(`/${locale}/travelers/${ticket._id}`)}>
                                            <TableCell className="font-medium text-right">{ticket.booking_number}</TableCell>
                                            <TableCell className="text-right">{ticket.customer?.name}</TableCell>
                                            <TableCell className="text-right">
                                                {ticket.take_off_date ? format(new Date(ticket.take_off_date), "dd/MM/yyyy") : "-"}
                                            </TableCell>
                                            <TableCell className="text-right">{ticket.ticket_salary?.toLocaleString()} ج.م</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={ticket.status === "paid" ? "default" : ticket.status === "cancel" ? "destructive" : "outline"}>
                                                    {tTravelers(ticket.status)}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {transfers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                                {t("noTickets")}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {pagination && pagination.pages > 1 && (
                                <div className="flex items-center justify-end space-x-2 py-4 rtl:space-x-reverse">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        {tCommon("previous")}
                                    </Button>
                                    <div className="text-sm font-medium">
                                        {page} / {pagination.pages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                        disabled={page === pagination.pages}
                                    >
                                        {tCommon("next")}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="mt-4">
                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">{t("date")}</TableHead>
                                        <TableHead className="text-right">{t("amount")}</TableHead>
                                        <TableHead className="text-right">{t("paymentMethod")}</TableHead>
                                        <TableHead className="text-right">{t("receiptNumber")}</TableHead>
                                        <TableHead className="text-right">{tCommon("notes")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment: any) => (
                                        <TableRow key={payment._id}>
                                            <TableCell className="text-right">
                                                {format(new Date(payment.payment_date), "dd/MM/yyyy")}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-green-600">
                                                {payment.amount?.toLocaleString()} ج.م
                                            </TableCell>
                                            <TableCell className="text-right">{tTravelers(payment.payment_method)}</TableCell>
                                            <TableCell className="text-right">{payment.receipt_number || "-"}</TableCell>
                                            <TableCell className="text-right text-muted-foreground text-sm">
                                                {payment.notes || "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {payments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                                {t("noPayments")}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
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
