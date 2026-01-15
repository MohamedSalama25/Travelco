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
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../../auth/store/authStore";
import { useConfirmation } from "@/hooks/useConfirmation";
import { EditProfileDialog } from "../../auth/components/EditProfileDialog";
import { IconUserCircle } from "@tabler/icons-react";
import { FullScreenLoader } from "@/components/globalComponents/FullScreenLoader";
import NotFound from "@/app/not-found";

export default function MemberDetails() {
    const { id } = useParams();
    const router = useRouter();
    const t = useTranslations("team");
    const tAuth = useTranslations("auth");
    const tCommon = useTranslations("common");
    const tTravelers = useTranslations("travelers");
    const [page, setPage] = useState(1);
    const { data: userDetails, isLoading } = useUserDetails(id as string, page);
    const queryClient = useQueryClient();
    const currentUser = useCurrentUser();
    const isManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';


    const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
    const [editProfileOpen, setEditProfileOpen] = useState(false);

    const updateAdvanceMutation = useUpdateAdvanceStatus();
    const deleteAdvanceMutation = useDeleteAdvance();
    const createAdvanceMutation = useCreateAdvance();

    const handleApprove = async (id: string) => {
        try {
            const res = await updateAdvanceMutation.mutateAsync({ id, status: 'approved' });
            queryClient.invalidateQueries({ queryKey: ['treasury-history'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-stats'] });
            toast.success(res.message || t("approveSuccess"));
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("approveError"));
        }
    };

    const handleReject = async (id: string) => {
        try {
            const res = await updateAdvanceMutation.mutateAsync({ id, status: 'rejected' });
            toast.success(res.message || t("rejectSuccess"));
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("rejectError"));
        }
    };

    const confirm = useConfirmation();

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirm(
            tCommon("confirmDelete"),
            tCommon("confirmDeleteDesc") || "Are you sure you want to delete this item?",
            <Trash2 className="w-12 h-12 text-red-500 mb-4" />
        );

        if (isConfirmed) {
            try {
                const res = await deleteAdvanceMutation.mutateAsync(id);
                toast.success(res.message || tCommon("deleteSuccess"));
            } catch (error: any) {
                toast.error(error.response?.data?.message || tCommon("deleteError"));
            }
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: "date",
            header: t("date"),
            cell: ({ row }: any) => (
                <div>
                    {row.original.date
                        ? new Date(row.original.date).toLocaleDateString("en-GB")
                        : "-"}
                </div>
            ),
        },
        {
            accessorKey: "amount",
            header: t("amount"),
            cell: ({ row }: any) => (
                <div className="font-bold">
                    {row.original.amount?.toLocaleString("en-US") ?? 0}
                </div>
            ),
        },
        {
            accessorKey: "reason",
            header: () => <div className="text-center">{t("reason")}</div>,
            cell: ({ row }: any) => (
                <div className="text-center">{row.original.reason}</div>
            ),
        },
        {
            accessorKey: "status",
            header: () => <div className="text-center">{t("status")}</div>,
            cell: ({ row }: any) => (
                <div className="text-center">
                    <Badge variant={
                        row.original.status === 'approved' ? 'default' :
                            row.original.status === 'rejected' ? 'destructive' :
                                row.original.status === 'repaid' ? 'outline' : 'secondary'
                    }
                        className={
                            row.original.status === 'approved' ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                                row.original.status === 'rejected' ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                                    row.original.status === 'repaid' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-700' : ''
                        }
                    >
                        {t(row.original.status)}
                    </Badge>
                </div>
            ),
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
        if (!isManager) return [];
        return allActions;
    };

    if (isLoading) return <FullScreenLoader />;
    if (!userDetails) return <NotFound />;

    const { user, stats, advances } = userDetails.data;
    const pagination = userDetails.pagination?.advances || { total: 0, limit: 10 };

    const handleAddAdvance = async (data: any) => {
        try {
            const res = await createAdvanceMutation.mutateAsync({ ...data, user: user._id });
            queryClient.invalidateQueries({ queryKey: ['treasury-history'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-stats'] });
            toast.success(res.message || t("addSuccess"));
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("addError"));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 px-2">

                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {user.user_name}
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <span>{user.email}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span>{user.phone}</span>
                    </p>
                </div>
                <div className="mr-auto rtl:ml-0 ltr:ml-auto flex gap-2">
                    {id === currentUser?.id && (
                        <>
                            <Button variant="outline" onClick={() => setEditProfileOpen(true)} className="gap-2">
                                <IconUserCircle className="h-4 w-4" />
                                {tAuth("editProfile")}
                            </Button>
                            <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />
                        </>
                    )}
                    <Badge variant="outline" className="px-3 py-1 font-medium bg-background/50">
                        {t(user.role)}
                    </Badge>
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="overflow-hidden border-none shadow-sm bg-linear-to-br from-card to-blue-500/5 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("transfers")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.transfers.totalTickets}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t("ticketsIssued")}</p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-none shadow-sm bg-linear-to-br from-card to-emerald-500/5 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("totalAdvances")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.advances.totalAdvances?.toLocaleString("en-US") ?? 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t("totalDisbursed")}</p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-none shadow-sm bg-linear-to-br from-card to-purple-500/5 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("totalRepaid")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.advances.totalRepaid?.toLocaleString("en-US") ?? 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t("repaid")}</p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-none shadow-sm border-primary/20 bg-linear-to-br from-primary/10 to-primary/5 hover:shadow-md transition-shadow ring-1 ring-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider">{t("outstanding")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{stats.advances.outstanding?.toLocaleString("en-US") ?? 0}</div>
                        <p className="text-xs text-primary/70 mt-1">{t("totalApproved")}</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="advances" className="w-full">

                <TabsContent value="advances" className="space-y-4 pt-4">
                    {(!isManager || id == currentUser?.id) && <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
                        <Button onClick={() => setAdvanceDialogOpen(true)} className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
                            <Plus className="h-4 w-4" />
                            {t("requestAdvance")}
                        </Button>

                        <div className="space-y-1 text-right">
                            <h3 className="text-lg font-semibold">{t("advances")}</h3>
                            <p className="text-xs text-muted-foreground">{t("advanceHistoryDesc")}</p>
                        </div>

                    </div>}

                    <div dir="rtl" className="rounded-xl border bg-card shadow-sm overflow-hidden p-1">
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
