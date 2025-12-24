"use client";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCustomer } from "@/features/customers/hooks/useCustomers";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export const CustomerDetails = () => {
    const params = useParams();
    const t = useTranslations("customers");
    const id = params.id as string;

    const { data, isLoading, error } = useCustomer(id);

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
                <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-right text-sm font-medium">{t("bookingNumber")}</th>
                                <th className="px-4 py-3 text-right text-sm font-medium">{t("airCompany")}</th>
                                <th className="px-4 py-3 text-right text-sm font-medium">{t("country")}</th>
                                <th className="px-4 py-3 text-right text-sm font-medium">{t("ticketPrice")}</th>
                                <th className="px-4 py-3 text-right text-sm font-medium">{t("paid")}</th>
                                <th className="px-4 py-3 text-right text-sm font-medium">{t("remaining")}</th>
                                <th className="px-4 py-3 text-right text-sm font-medium">{t("status")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y bg-card">
                            {transfers.map((transfer) => (
                                <tr key={transfer._id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3 font-medium">{transfer.booking_number}</td>
                                    <td className="px-4 py-3 text-sm">{transfer.air_comp.name}</td>
                                    <td className="px-4 py-3 text-sm">{transfer.country}</td>
                                    <td className="px-4 py-3 text-sm">{transfer.ticket_price.toLocaleString()} ج.م</td>
                                    <td className="px-4 py-3 text-sm text-green-600 font-medium">{transfer.total_paid.toLocaleString()} ج.م</td>
                                    <td className="px-4 py-3 text-sm text-red-600 font-medium">{transfer.remaining_amount.toLocaleString()} ج.م</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transfer.status === 'paid' ? 'bg-green-100 text-green-800' :
                                            transfer.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {t(transfer.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};