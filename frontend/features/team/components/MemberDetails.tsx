'use client';

import { useUserDetails, useUpdateUser } from "../hooks/useUsers";
import { useAdvances, useUpdateAdvanceStatus, useDeleteAdvance, useCreateAdvance } from "../hooks/useAdvances";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Check, X, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";// Local import
import { toast } from "sonner";
import { type Advance, type TeamMember } from "../types/team";
import AddAdvanceDialog from "./AddAdvanceDialog";

export default function MemberDetails() {
    const { id } = useParams();
    const router = useRouter();
    const t = useTranslations("team");
    const tCommon = useTranslations("common");
    const { data: userDetails, isLoading } = useUserDetails(id as string);

    const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);

    const updateAdvanceMutation = useUpdateAdvanceStatus();
    const deleteAdvanceMutation = useDeleteAdvance();
    const createAdvanceMutation = useCreateAdvance();

    if (isLoading) return <div className="p-8 text-center">{tCommon("loading")}</div>;
    if (!userDetails) return <div className="p-8 text-center text-destructive">{tCommon("loadError")}</div>;

    const { user, stats, advances } = userDetails.data;

    const handleApprove = async (advanceId: string) => {
        if (confirm(t("confirmApprove"))) {
            try {
                await updateAdvanceMutation.mutateAsync({ id: advanceId, status: 'approved' });
                toast.success(t("updateSuccess"));
            } catch (error: any) {
                toast.error(error.response?.data?.message || t("updateError"));
            }
        }
    };

    const handleReject = async (advanceId: string) => {
        if (confirm(t("confirmReject"))) {
            try {
                await updateAdvanceMutation.mutateAsync({ id: advanceId, status: 'rejected' });
                toast.success(t("updateSuccess"));
            } catch (error: any) {
                toast.error(error.response?.data?.message || t("updateError"));
            }
        }
    };

    const handleDelete = async (advanceId: string) => {
        if (confirm(tCommon("confirmDelete"))) {
            try {
                await deleteAdvanceMutation.mutateAsync(advanceId);
                toast.success(t("deleteSuccess"));
            } catch (error: any) {
                toast.error(error.response?.data?.message || t("deleteError"));
            }
        }
    };

    const handleAddAdvance = async (data: any) => {
        try {
            await createAdvanceMutation.mutateAsync({ ...data, user: user._id });
            toast.success(t("addSuccess"));
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("addError"));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 px-2">

                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {user.user_name}
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <span>{user.email}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span>{user.phone}</span>
                    </p>
                </div>
                <div className="mr-auto rtl:ml-0 ltr:ml-auto flex gap-2">
                    <Badge variant="outline" className="px-3 py-1 font-medium bg-background/50">
                        {t(user.role)}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => router.back()} >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-card to-blue-500/5 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("transfers")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.transfers.totalTickets}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t("ticketsIssued")}</p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-card to-emerald-500/5 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("payments")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.payments.totalPayments}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t("paymentsRecorded")}</p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-card to-purple-500/5 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("customers")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.customers.totalCustomersCreated}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t("newCustomer")}</p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-none shadow-sm border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-md transition-shadow ring-1 ring-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider">{t("totalAdvances")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{stats.advances.totalAdvances}</div>
                        <p className="text-xs text-primary/70 mt-1">{t("totalApproved")}</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="advances" className="w-full">

                <TabsContent value="advances" className="space-y-4 pt-4">
                    <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
                        <Button onClick={() => setAdvanceDialogOpen(true)} className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
                            <Plus className="h-4 w-4" />
                            {t("requestAdvance")}
                        </Button>

                        <div className="space-y-1 text-right">
                            <h3 className="text-lg font-semibold">{t("advances")}</h3>
                            <p className="text-xs text-muted-foreground">{t("advanceHistoryDesc")}</p>
                        </div>

                    </div>

                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <Table dir="rtl">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="text-right font-semibold">{t("date")}</TableHead>
                                    <TableHead className="text-right font-semibold">{t("amount")}</TableHead>
                                    <TableHead className="text-right font-semibold">{t("reason")}</TableHead>
                                    <TableHead className="text-right font-semibold">{t("status")}</TableHead>
                                    <TableHead className="text-left font-semibold">{tCommon("actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {advances.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                                    <X className="h-6 w-6 opacity-20" />
                                                </div>
                                                <span>{t("noAdvances")}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    advances.map((advance: Advance) => (
                                        <TableRow key={advance._id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-right text-muted-foreground">{new Date(advance.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right font-bold text-lg">{advance.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right max-w-[200px] truncate" title={advance.reason}>
                                                {advance.reason}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={
                                                    advance.status === 'approved' ? 'default' :
                                                        advance.status === 'rejected' ? 'destructive' : 'secondary'
                                                } className="font-normal px-2">
                                                    {t(advance.status) || advance.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-left">
                                                <div className="flex justify-start gap-1">
                                                    {advance.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleApprove(advance._id)}
                                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-100"
                                                                title={t("approve")}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleReject(advance._id)}
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                                                                title={t("reject")}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleDelete(advance._id)}
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                                                title={tCommon("delete")}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            <AddAdvanceDialog
                open={advanceDialogOpen}
                onOpenChange={setAdvanceDialogOpen}
                onSubmit={handleAddAdvance}
            />
        </div>
    );
}
