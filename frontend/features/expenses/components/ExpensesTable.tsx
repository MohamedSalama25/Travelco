'use client';

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Expense } from "../types/types";
import UniTable from "@/components/data-table";
import { FullScreenLoader } from "@/components/globalComponents/FullScreenLoader";
import Error from "@/components/globalComponents/Error";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

interface ExpensesTableProps {
    data: Expense[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
    onPageChange: (page: number) => void;
    isLoading: boolean;
    isError: boolean;
    error: any;
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
}

export function ExpensesTable({
    data,
    pagination,
    onPageChange,
    isLoading,
    isError,
    error,
    onEdit,
    onDelete
}: ExpensesTableProps) {
    const t = useTranslations("expenses");
    const tCommon = useTranslations("common");

    const columns: ColumnDef<Expense>[] = useMemo(() => [
        {
            accessorKey: "date",
            header: tCommon("date"),
            cell: ({ row }) => <span>{format(new Date(row.original.date), "dd/MM/yyyy")}</span>
        },
        {
            accessorKey: "title",
            header: t("expenseTitle"),
            cell: ({ row }) => <span className="font-medium">{row.original.title}</span>
        },
        {
            accessorKey: "amount",
            header: t("amount"),
            cell: ({ row }) => <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.original.amount)}</span>
        },
        {
            accessorKey: "category",
            header: t("category"),
            cell: ({ row }) => <span>{t(`categories.${row.original.category.toLowerCase()}` as any) || row.original.category}</span>
        },
        {
            accessorKey: "description",
            header: t("description"),
            cell: ({ row }) => <span className="max-w-[200px] truncate block" title={row.original.description}>{row.original.description}</span>
        },
        {
            id: "actions",
            header: tCommon("actions"),
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(row.original._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            )
        }
    ], [t, tCommon, onEdit, onDelete]);

    if (isLoading) {
        return <FullScreenLoader />;
    }

    if (isError || error) {
        return <Error message={error?.message} />;
    }

    return (
        <UniTable<Expense>
            columns={columns}
            data={data}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            currentPage={pagination.page}
            tableName={t("title")}
            onPageChange={onPageChange}
            isLoading={isLoading}
        />
    );
}
