"use client";

import { useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, Plus, Search, Trash2, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import UniTable from "@/components/data-table";
import { useTranslations } from "next-intl";
import { Customer } from "../types/types";
import { useCustomersStore } from "../store/customersStore";
import { CustomersListResponse } from "../types/types";
import { useRouter } from "next/navigation";

interface CustomersTableProps {
    data: Customer[];
    pagination?: CustomersListResponse['pagination'];
    isLoading: boolean;
    onAdd: () => void;
    onEdit: (customer: Customer) => void;
    onDelete: (customer: Customer) => void;
}

export default function CustomersTable({
    data,
    pagination,
    isLoading,
    onAdd,
    onEdit,
    onDelete
}: CustomersTableProps) {
    const t = useTranslations("table");
    const tCustomers = useTranslations("customers");
    const router = useRouter();

    const {
        searchQuery,
        setSearchQuery,
        setCurrentPage,
    } = useCustomersStore();

    const handleEdit = useCallback((customer: Customer) => {
        onEdit(customer);
    }, [onEdit]);

    const handleView = useCallback((customer: Customer) => {
        router.push(`/customers/${customer._id}`);
    }, []);

    const handleDelete = useCallback((customer: Customer) => {
        onDelete(customer);
    }, [onDelete]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, [setCurrentPage]);

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
            accessorKey: "nationality",
            header: tCustomers("nationality"),
            cell: ({ row }) => row.original.nationality || "-",
        },
    ], [tCustomers]);

    // Define actions
    const actions = useMemo(() => [
        {
            label: "View",
            onClick: handleView,
        },
        {
            label: "Edit",
            onClick: handleEdit,
        },
        {
            label: "Delete",
            onClick: handleDelete,
        },
    ], [handleEdit, handleDelete, handleView]);

    return (
        <div className="space-y-4">
            {/* Header with Filter and Actions */}
            <div className="flex gap-3 items-center bg-card px-3 rounded-xl justify-between py-3 flex-wrap" >
                {/* Name Filter */}
                <div className="relative w-75  max-w-[500px] ">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={`${t("search")} ${tCustomers("name")}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Add Customer Button */}
                <Button
                    onClick={onAdd}
                    className="gap-1 bg-primary"
                >
                    <Plus className="h-4 w-4 mt-1" />
                    {tCustomers("addCustomer")}
                </Button>
            </div>

            {/* UniTable */}
            <UniTable<Customer>
                columns={columns}
                data={data || []}
                totalItems={pagination?.total || 0}
                itemsPerPage={pagination?.limit || 10}
                currentPage={pagination?.page || 1}
                tableName={tCustomers("title")}
                actions={actions}
                onPageChange={handlePageChange}
                isLoading={isLoading}
            />
        </div>
    );
}
