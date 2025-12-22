'use client';

import { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import UniTable from "@/components/data-table";
import AddTeamMemberDialog from "./AddTeamMemberDialog";
import { useTranslations } from "next-intl";
import { type TeamMember, type TeamMemberFormData } from "../types/team";
import { useUsers, useDeleteUser, useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TeamTable() {
    const t = useTranslations("table");
    const tTeam = useTranslations("team");
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const [nameFilter, setNameFilter] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    const { data: usersData, isLoading } = useUsers({
        page: currentPage,
        limit: 10,
        name: nameFilter || undefined
    });

    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();

    const handleAddMember = async (data: TeamMemberFormData) => {
        try {
            await createUserMutation.mutateAsync(data);
            toast.success(tTeam("addSuccess"));
        } catch (error: any) {
            toast.error(error.response?.data?.message || tTeam("addError"));
        }
    };

    const handleEditMember = async (data: TeamMemberFormData) => {
        if (!editingMember) return;
        try {
            await updateUserMutation.mutateAsync({ id: editingMember._id, data });
            toast.success(tTeam("updateSuccess"));
            setEditingMember(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || tTeam("updateError"));
        }
    };

    const handleEdit = useCallback((member: TeamMember) => {
        setEditingMember(member);
        setDialogOpen(true);
    }, []);

    const handleDelete = useCallback(async (member: TeamMember) => {
        if (confirm(t("confirmDelete"))) {
            try {
                await deleteUserMutation.mutateAsync(member._id);
                toast.success(tTeam("deleteSuccess"));
            } catch (error: any) {
                toast.error(error.response?.data?.message || tTeam("deleteError"));
            }
        }
    }, [t, tTeam, deleteUserMutation]);

    const handleViewDetails = useCallback((member: TeamMember) => {
        router.push(`/team/${member._id}`);
    }, [router]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingMember(null);
    };

    // Define columns
    const columns: ColumnDef<TeamMember>[] = useMemo(() => [
        {
            accessorKey: "user_name",
            header: tTeam("member"),
        },
        {
            accessorKey: "email",
            header: tTeam("email"),
        },
        {
            accessorKey: "phone",
            header: tTeam("phone"),
            cell: ({ row }) => row.original.phone || "-",
        },
        {
            accessorKey: "role",
            header: tTeam("role"),
            cell: ({ row }) => {
                const role = row.original.role;
                const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
                    admin: "destructive",
                    manager: "default",
                    accountant: "secondary",
                };

                return (
                    <Badge variant={variants[role] || "default"}>
                        {tTeam(role)}
                    </Badge>
                );
            },
        },

        {
            accessorKey: "status",
            header: tTeam("status"),
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'active' ? 'outline' : 'secondary'}>
                    {tTeam(row.original.status)}
                </Badge>
            )
        },

    ], [tTeam]);

    // Define actions
    const actions = useMemo(() => [
        {
            label: t("details"),
            icon: Eye,
            onClick: handleViewDetails,
        },
        {
            label: t("edit"),
            onClick: handleEdit,
        },
        {
            label: t("delete"),
            onClick: handleDelete,
        },
    ], [handleEdit, handleDelete, handleViewDetails, t]);

    return (
        <div className="space-y-4">
            <div className="flex gap-2 items-center bg-card px-3 rounded-xl justify-end">
                <div className="relative flex-1 my-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={`${t("search")} ${tTeam("member")}...`}
                        value={nameFilter}
                        onChange={(e) => {
                            setNameFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-9"
                    />
                </div>

                <Button
                    onClick={() => setDialogOpen(true)}
                    className="gap-1 bg-primary"
                >
                    <Plus className="h-4 w-4 mt-1" />
                    {tTeam("addMember")}
                </Button>
            </div>

            <UniTable<TeamMember>
                columns={columns}
                data={usersData?.data || []}
                totalItems={usersData?.pagination?.total || 0}
                itemsPerPage={10}
                currentPage={currentPage}
                tableName={tTeam("members")}
                actions={actions}
                onPageChange={handlePageChange}
                isLoading={isLoading}
            />

            <AddTeamMemberDialog
                open={dialogOpen}
                onOpenChange={handleDialogClose}
                onSubmit={editingMember ? handleEditMember : handleAddMember}
                member={editingMember}
            />
        </div>
    );
}
