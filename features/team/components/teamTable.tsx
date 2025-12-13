"use client";

import { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import UniTable from "@/components/data-table";
import AddTeamMemberDialog from "./addTeamMemberDialog";
import { useTranslations } from "next-intl";
import { mockTeamMembers, type TeamMember, type TeamMemberFormData } from "../types/team";

export default function TeamTable() {
    const t = useTranslations("table");
    const tTeam = useTranslations("team");

    const [members, setMembers] = useState<TeamMember[]>(mockTeamMembers);
    const [archivedMembers, setArchivedMembers] = useState<TeamMember[]>([]);
    const [showArchived, setShowArchived] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [nameFilter, setNameFilter] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    // Filter logic - name only
    const filteredMembers = useMemo(() => {
        return (showArchived ? archivedMembers : members).filter((member) => {
            if (nameFilter) {
                const nameLower = nameFilter.toLowerCase();
                return member.name.toLowerCase().includes(nameLower);
            }
            return true;
        });
    }, [members, archivedMembers, showArchived, nameFilter]);

    const handleAddMember = useCallback((data: TeamMemberFormData) => {
        const newMember: TeamMember = {
            id: Date.now().toString(),
            ...data,
            joinDate: new Date().toISOString().split("T")[0],
        };
        setMembers((prev) => [newMember, ...prev]);
    }, []);

    const handleEditMember = useCallback((data: TeamMemberFormData) => {
        if (!editingMember) return;

        setMembers((prev) =>
            prev.map((m) =>
                m.id === editingMember.id
                    ? { ...m, ...data }
                    : m
            )
        );
        setEditingMember(null);
    }, [editingMember]);

    const handleEdit = useCallback((member: TeamMember) => {
        setEditingMember(member);
        setDialogOpen(true);
    }, []);

    const handleDelete = useCallback((member: TeamMember) => {
        if (showArchived) {
            if (confirm(t("confirmPermanentDelete"))) {
                setArchivedMembers((prev) => prev.filter((m) => m.id !== member.id));
            }
        } else {
            if (confirm(t("confirmDelete"))) {
                setMembers((prev) => prev.filter((m) => m.id !== member.id));
                setArchivedMembers((prev) => [
                    ...prev,
                    { ...member, isArchived: true },
                ]);
            }
        }
    }, [showArchived, t]);

    const handleRestore = useCallback((member: TeamMember) => {
        setArchivedMembers((prev) => prev.filter((m) => m.id !== member.id));
        setMembers((prev) => [
            ...prev,
            { ...member, isArchived: false },
        ]);
    }, []);

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
            accessorKey: "name",
            header: tTeam("member"),
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "role",
            header: tTeam("role"),
            cell: ({ row }) => {
                const role = row.original.role;
                const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
                    admin: "destructive",
                    manager: "default",
                    developer: "secondary",
                    designer: "outline",
                };

                return (
                    <Badge variant={variants[role] || "default"}>
                        {tTeam(role)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "department",
            header: tTeam("department"),
            cell: ({ row }) => row.original.department || "-",
        },
        {
            accessorKey: "joinDate",
            header: "Join Date",
        },
    ], [tTeam]);

    // Define actions
    const actions = useMemo(() => {
        if (showArchived) {
            return [
                {
                    label: "Restore",
                    onClick: handleRestore,
                },
                {
                    label: "Delete",
                    onClick: handleDelete,
                },
            ];
        } else {
            return [
                {
                    label: "Edit",
                    onClick: handleEdit,
                },
                {
                    label: "Delete",
                    onClick: handleDelete,
                },
            ];
        }
    }, [showArchived, handleEdit, handleDelete, handleRestore]);

    return (
        <div className="space-y-4">
            {/* Header with Filter and Actions */}
            <div className="flex gap-2 items-center bg-card px-3 rounded-xl justify-end">
                {/* Name Filter */}
                <div className="relative flex-1 my-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={`${t("search")} ${tTeam("member")}...`}
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Archive Toggle */}
                <Button
                    variant="outline"
                    onClick={() => {
                        setShowArchived(!showArchived);
                        setCurrentPage(1);
                    }}
                    className="gap-2"
                >
                    <Archive className="h-4 w-4" />
                    {showArchived ? tTeam("title") : t("archive")}
                    {archivedMembers.length > 0 && !showArchived && (
                        <Badge variant="secondary" className="ml-1">
                            {archivedMembers.length}
                        </Badge>
                    )}
                </Button>

                {/* Add Member Button */}
                {!showArchived && (
                    <Button
                        onClick={() => setDialogOpen(true)}
                        className="gap-1 bg-primary"
                    >
                        <Plus className="h-4 w-4 mt-1" />
                        {tTeam("addMember")}
                    </Button>
                )}
            </div>

            {/* UniTable */}
            <UniTable<TeamMember>
                columns={columns}
                data={filteredMembers.slice((currentPage - 1) * 5, currentPage * 5)}
                totalItems={filteredMembers.length}
                itemsPerPage={5}
                currentPage={currentPage}
                tableName={tTeam("members")}
                actions={actions}
                onPageChange={handlePageChange}
            />

            {/* Add/Edit Member Dialog */}
            <AddTeamMemberDialog
                open={dialogOpen}
                onOpenChange={handleDialogClose}
                onSubmit={editingMember ? handleEditMember : handleAddMember}
                member={editingMember}
            />
        </div>
    );
}
