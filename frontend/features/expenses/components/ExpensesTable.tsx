'use client';

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Expense } from "../types/types";
import UniTable from "@/components/data-table";
import { FullScreenLoader } from "@/components/globalComponents/FullScreenLoader";
import Error from "@/components/globalComponents/Error";
import { format } from "date-fns";


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
    ], [t, tCommon]);


    const actions = useMemo(() => [
        {
            label: "تعديل",
            onClick: onEdit,
        },
        {
            label: "حذف",
            onClick: (expense: Expense) => onDelete(expense._id),
        },
    ], [onEdit, onDelete, t]);

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
            actions={actions}
        />
    );
}
