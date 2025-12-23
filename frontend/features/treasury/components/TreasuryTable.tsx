'use client';

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { TreasuryTransaction } from "../types/types";
import UniTable from "@/components/data-table";
import { FullScreenLoader } from "@/components/globalComponents/FullScreenLoader";
import Error from "@/components/globalComponents/Error";

interface TreasuryTableProps {
    data: TreasuryTransaction[];
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
}

export function TreasuryTable({
    data,
    pagination,
    onPageChange,
    isLoading,
    isError,
    error
}: TreasuryTableProps) {
    const t = useTranslations("treasury");
    const tCommon = useTranslations("common");

    const columns: ColumnDef<TreasuryTransaction>[] = useMemo(() => [
        {
            accessorKey: "createdAt",
            header: tCommon("date"),
            cell: ({ row }) => <span className="text-muted-foreground">{new Date(row.original.createdAt).toLocaleString()}</span>
        },
        {
            accessorKey: "description",
            header: t("description"),
            cell: ({ row }) => <span className="font-medium">{row.original.description}</span>
        },
        {
            accessorKey: "type",
            header: t("type"),
            cell: ({ row }) => (
                <Badge variant={row.original.type === 'in' ? 'default' : 'destructive'}
                    className={row.original.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                    {row.original.type === 'in' ? t('income') : t('expense')}
                </Badge>
            )
        },
        {
            accessorKey: "amount",
            header: t("amount"),
            cell: ({ row }) => (
                <span className={`font-bold ${row.original.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {row.original.type === 'in' ? '+' : '-'}{row.original.amount.toLocaleString()} ج.م
                </span>
            )
        },
        {
            accessorKey: "relatedModel",
            header: t("source"),
            cell: ({ row }) => {
                const source = row.original.relatedModel.toLowerCase();
                const key = source === 'expense' ? 'expense_source' : source;
                return <span>{t(key)}</span>
            }
        },
        {
            accessorKey: "createdBy.user_name",
            header: t("by"),
            cell: ({ row }) => <span className="text-xs">{row.original.createdBy?.user_name || '--'}</span>
        }
    ], [t, tCommon]);

    if (isLoading) {
        return <FullScreenLoader />;
    }

    if (isError || error) {
        return <Error message={error?.message} />;
    }

    return (
        <UniTable<TreasuryTransaction>
            columns={columns}
            data={data}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            currentPage={pagination.page}
            tableName={t("history")}
            onPageChange={onPageChange}
            isLoading={isLoading}
        />
    );
}
