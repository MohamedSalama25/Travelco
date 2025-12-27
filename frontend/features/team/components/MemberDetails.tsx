'use client';

import { useUserDetails, useUpdateUser } from "../hooks/useUsers";
import { useAdvances, useUpdateAdvanceStatus, useDeleteAdvance, useCreateAdvance } from "../hooks/useAdvances";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Plus, Check, X, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AddAdvanceDialog from "./AddAdvanceDialog";
import { useMemo, useState } from "react";
import UniTable from "@/components/data-table";

export default function MemberDetails() {
    const { id } = useParams();
    const router = useRouter();
    const t = useTranslations("team");
    const tCommon = useTranslations("common");
    const [page, setPage] = useState(1);
    const { data: userDetails, isLoading } = useUserDetails(id as string, page);

    const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);

    const updateAdvanceMutation = useUpdateAdvanceStatus();
    const deleteAdvanceMutation = useDeleteAdvance();
    const createAdvanceMutation = useCreateAdvance();

    const handleApprove = async (id: string) => {
        try {
            await updateAdvanceMutation.mutateAsync({ id, status: 'approved' });
            toast.success(t("approveSuccess"));
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("approveError"));
        }
    };

    const handleReject = async (id: string) => {
        try {
            await updateAdvanceMutation.mutateAsync({ id, status: 'rejected' });
            toast.success(t("rejectSuccess"));
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("rejectError"));
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(tCommon("confirmDelete"))) return;
        try {
            await deleteAdvanceMutation.mutateAsync(id);
            toast.success(tCommon("deleteSuccess"));
        } catch (error: any) {
            toast.error(error.response?.data?.message || tCommon("deleteError"));
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: "date",
            header: t("date"),
            cell: ({ row }: any) => <span>{row.original.date ? new Date(row.original.date).toLocaleDateString() : '-'}</span>
        },
        {
            accessorKey: "amount",
            header: t("amount"),
            cell: ({ row }: any) => <span className="font-bold text-lg">{row.original.amount?.toLocaleString() ?? 0}</span>
        },
        {
            accessorKey: "reason",
            header: t("reason"),
        },
        {
            accessorKey: "status",
            header: t("status"),
            cell: ({ row }: any) => (
                <Badge variant={
                    row.original.status === 'approved' ? 'default' :
                        row.original.status === 'rejected' ? 'destructive' : 'secondary'
                } className="font-normal px-2">
                    {t(row.original.status) || row.original.status}
                </Badge>
            )
        },
    ], [t]);

    const actions = useMemo(() => [
        {
            label: t("approve"),
            onClick: (row: any) => handleApprove(row._id),
            icon: Check,
            classname: "text-green-600 hover:text-green-700 hover:bg-green-50 border-green-100",
        },
        {
            label: t("reject"),
            onClick: (row: any) => handleReject(row._id),
            icon: X,
            classname: "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100",
        },
        {
            label: tCommon("delete"),
            onClick: (row: any) => handleDelete(row._id),
            icon: Trash2,
            classname: "text-muted-foreground hover:text-destructive hover:bg-destructive/5",
        }
    ], [t, tCommon]);

    const filterActions = (row: any, allActions: any[]) => {
        if (row.status !== 'pending') return [];
        return allActions;
    };

    if (isLoading) return <div className="p-8 text-center">{tCommon("loading")}</div>;
    if (!userDetails) return <div className="p-8 text-center text-destructive">{tCommon("loadError")}</div>;

    const { user, stats, advances } = userDetails.data;
    const pagination = userDetails.pagination?.advances || { total: 0, limit: 10 };

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

                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden p-1">
                        <UniTable
                            columns={columns}
                            data={advances}
                            totalItems={pagination.total}
                            itemsPerPage={pagination.limit}
                            currentPage={page}
                            onPageChange={setPage}
                            tableName={t("advances")}
                            isLoading={isLoading}
                            actions={actions}
                            filterActions={filterActions}
                        />
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
