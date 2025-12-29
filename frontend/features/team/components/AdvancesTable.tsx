'use client';

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import UniTable from "@/components/data-table";
import { useTranslations } from "next-intl";
import { type Advance } from "../types/team";
import { useAdvances, useUpdateAdvanceStatus, useAdvanceStats, useRepayAdvance } from "../hooks/useAdvances";
import { toast } from "sonner";
import { AdvancesStats } from "./AdvancesStats";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../../auth/store/authStore";

export default function AdvancesTable() {
    const t = useTranslations("team");
    const tCommon = useTranslations("common");
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>("pending");
    const queryClient = useQueryClient();
    const user = useCurrentUser();
    const isManager = user?.role === 'admin' || user?.role === 'manager';

    const { data: advancesData, isLoading } = useAdvances({
        page: currentPage,
        limit: 10,
        status: statusFilter !== "all" ? statusFilter : undefined
    });

    const { data: statsData } = useAdvanceStats();
    const updateAdvanceMutation = useUpdateAdvanceStatus();
    const repayAdvanceMutation = useRepayAdvance();

    const handleApprove = async (advance: Advance) => {
        if (confirm(t("confirmApprove"))) {
            try {
                const res = await updateAdvanceMutation.mutateAsync({ id: advance._id, status: 'approved' });
                queryClient.invalidateQueries({ queryKey: ['treasury-history'] });
                queryClient.invalidateQueries({ queryKey: ['treasury-stats'] });
                toast.success(res.message || t("updateSuccess"));
            } catch (error: any) {
                toast.error(error.response?.data?.message || t("updateError"));
            }
        }
    };

    const handleReject = async (advance: Advance) => {
        if (confirm(t("confirmReject"))) {
            try {
                const res = await updateAdvanceMutation.mutateAsync({ id: advance._id, status: 'rejected' });
                queryClient.invalidateQueries({ queryKey: ['treasury-history'] });
                toast.success(res.message || t("updateSuccess"));
            } catch (error: any) {
                toast.error(error.response?.data?.message || t("updateError"));
            }
        }
    };

    const handleRepay = async (advance: Advance) => {
        if (confirm(t("confirmRepay"))) {
            try {
                const res = await repayAdvanceMutation.mutateAsync(advance._id);
                queryClient.invalidateQueries({ queryKey: ['treasury-history'] });
                queryClient.invalidateQueries({ queryKey: ['treasury-stats'] });
                toast.success(res.message || t("updateSuccess"));
            } catch (error: any) {
                toast.error(error.response?.data?.message || t("updateError"));
            }
        }
    };

    const columns: ColumnDef<Advance>[] = useMemo(() => [
        {
            accessorKey: "user.user_name",
            header: t("member"),
            cell: ({ row }) => (row.original.user as any)?.user_name || "-",
        },
        {
            accessorKey: "amount",
            header: t("amount"),
            cell: ({ row }) => <span className="font-bold">{row.original.amount}</span>,
        },
        {
            accessorKey: "reason",
            header: t("reason"),
        },
        {
            accessorKey: "date",
            header: t("date"),
            cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
        },
        {
            accessorKey: "status",
            header: t("status"),
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge variant={
                        status === 'approved' ? 'default' :
                            status === 'rejected' ? 'destructive' :
                                status === 'repaid' ? 'outline' : 'secondary'
                    }
                        className={
                            status === 'approved' ? 'bg-green-100 text-green-800' :
                                status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    status === 'repaid' ? 'bg-blue-100 text-blue-800' : ''
                        }
                    >
                        {t(status)}
                    </Badge>
                );
            },
        },
    ], [t]);

    const actions = useMemo(() => [
        {
            label: t("approve"),
            onClick: handleApprove,
            show: (item: Advance) => item.status === 'pending' && isManager,
        },
        {
            label: t("reject"),
            onClick: handleReject,
            show: (item: Advance) => item.status === 'pending' && isManager,
        },
        {
            label: t("repay"),
            onClick: handleRepay,
            show: (item: Advance) => item.status === 'approved' && isManager,
        },
    ], [handleApprove, handleReject, handleRepay, t, isManager]);

    return (
        <div className="space-y-4">
            <AdvancesStats stats={statsData?.data} />
            <div className="flex gap-2 items-center bg-card px-3 py-4 rounded-xl justify-between">
                <div className="flex gap-2">
                    <Button
                        variant={statusFilter === 'pending' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('pending')}
                        size="sm"
                    >
                        {t("pendingAdvances")}
                    </Button>
                    <Button
                        variant={statusFilter === 'all' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('all')}
                        size="sm"
                    >
                        {tCommon("all")}
                    </Button>
                </div>
            </div>

            <UniTable<Advance>
                columns={columns}
                data={advancesData?.data || []}
                totalItems={advancesData?.pagination?.total || 0}
                itemsPerPage={10}
                currentPage={currentPage}
                tableName={t("advances")}
                actions={actions}
                onPageChange={setCurrentPage}
                isLoading={isLoading}
            />
        </div>
    );
}
