"use client";

import { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, Plus, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import UniTable from "@/components/data-table";
import AddCustomerDialog from "./addCustomerDialog";
import { useTranslations } from "next-intl";
import { mockCustomers, type Customer, type CustomerFormData } from "../types/customer";
import { useConfirmation } from "@/hooks/useConfirmation";

export default function CustomersTable() {
    const t = useTranslations("table");
    const tCustomers = useTranslations("customers");

    const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
    const [archivedCustomers, setArchivedCustomers] = useState<Customer[]>([]);
    const [showArchived, setShowArchived] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [nameFilter, setNameFilter] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const confirm = useConfirmation();


    // Filter logic - name only
    const filteredCustomers = useMemo(() => {
        return (showArchived ? archivedCustomers : customers).filter((customer) => {
            if (nameFilter) {
                const nameLower = nameFilter.toLowerCase();
                return customer.name.toLowerCase().includes(nameLower);
            }
            return true;
        });
    }, [customers, archivedCustomers, showArchived, nameFilter]);

    const handleAddCustomer = useCallback((data: CustomerFormData) => {
        const newCustomer: Customer = {
            id: Date.now().toString(),
            ...data,
            joinDate: new Date().toISOString().split("T")[0],
        };
        setCustomers((prev) => [newCustomer, ...prev]);
    }, []);

    const handleEditCustomer = useCallback((data: CustomerFormData) => {
        if (!editingCustomer) return;

        setCustomers((prev) =>
            prev.map((c) =>
                c.id === editingCustomer.id
                    ? { ...c, ...data }
                    : c
            )
        );
        setEditingCustomer(null);
    }, [editingCustomer]);

    const handleEdit = useCallback((customer: Customer) => {
        setEditingCustomer(customer);
        setDialogOpen(true);
    }, []);

    const handleDelete = useCallback(async (customer: Customer) => {
        if (showArchived) {
            // Permanent delete from archive
            const confirmed = await confirm(t("confirmPermanentDelete"), t("confirmPermanentDeleteMessage"), <Trash2 className="w-16 h-16 text-red-500" />);
            if (confirmed) {
                setArchivedCustomers((prev) => prev.filter((c) => c.id !== customer.id));
            }
        } else {
            // Move to archive (soft delete)
            const confirmed = await confirm(t("confirmDelete"), t("confirmDeleteMessage"), <Trash2 className="w-16 h-16 text-red-500" />);
            if (confirmed) {
                setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
                setArchivedCustomers((prev) => [
                    ...prev,
                    { ...customer, isArchived: true },
                ]);
            }
        }
    }, [showArchived, t, confirm]);

    const handleRestore = useCallback((customer: Customer) => {
        setArchivedCustomers((prev) => prev.filter((c) => c.id !== customer.id));
        setCustomers((prev) => [
            ...prev,
            { ...customer, isArchived: false },
        ]);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingCustomer(null);
    };

    // Define columns
    const columns: ColumnDef<Customer>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: tCustomers("name"),
        },
        {
            accessorKey: "email",
            header: tCustomers("email"),
        },
        {
            accessorKey: "phone",
            header: tCustomers("phone"),
        },
        {
            accessorKey: "company",
            header: tCustomers("company"),
            cell: ({ row }) => row.original.company || "-",
        },
        {
            accessorKey: "joinDate",
            header: tCustomers("joinDate"),
        },
    ], [tCustomers]);

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
                        placeholder={`${t("search")} ${tCustomers("name")}...`}
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
                    {showArchived ? tCustomers("title") : t("archive")}
                    {archivedCustomers.length > 0 && !showArchived && (
                        <Badge variant="secondary" className="ml-1">
                            {archivedCustomers.length}
                        </Badge>
                    )}
                </Button>

                {/* Add Customer Button */}
                {!showArchived && (
                    <Button
                        onClick={() => setDialogOpen(true)}
                        className="gap-1 bg-primary"
                    >
                        <Plus className="h-4 w-4 mt-1" />
                        {tCustomers("addCustomer")}
                    </Button>
                )}
            </div>

            {/* UniTable */}
            <UniTable<Customer>
                columns={columns}
                data={filteredCustomers}
                totalItems={filteredCustomers.length}
                itemsPerPage={5}
                currentPage={currentPage}
                tableName={tCustomers("title")}
                actions={actions}
                onPageChange={handlePageChange}
            />

            {/* Add/Edit Customer Dialog */}
            <AddCustomerDialog
                open={dialogOpen}
                onOpenChange={handleDialogClose}
                onSubmit={editingCustomer ? handleEditCustomer : handleAddCustomer}
                customer={editingCustomer}
            />
        </div>
    );
}
