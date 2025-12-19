import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AirComp, Pagination } from "../types/types";
import UniTable from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { useAirCompMutations } from "../hooks/useAirComps";
import { Button } from "@/components/ui/button";

interface AirCompsTableProps {
    data: AirComp[];
    pagination: Pagination;
    onPageChange: (page: number) => void;
    isLoading: boolean;
    onSearchChange?: (search: string) => void;
    onEdit: (airComp: AirComp) => void;
    handleCreate: () => void;
    onView: (airComp: AirComp) => void;
}

export function AirCompsTable({
    data,
    pagination,
    onPageChange,
    isLoading,
    onSearchChange,
    onEdit,
    handleCreate,
    onView
}: AirCompsTableProps) {
    const t = useTranslations("airComps");
    const tTable = useTranslations("table");
    const tGeneral = useTranslations("general");
    const [searchQuery, setSearchQuery] = useState("");
    const { confirm } = useConfirm();
    const { deleteMutation } = useAirCompMutations();

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        onSearchChange?.(value);
    };

    const handleDelete = async (airComp: AirComp) => {
        const confirmed = await confirm({
            title: tTable("confirmDelete"),
            description: tTable("confirmPermanentDelete"),
            icon: <Trash2 className="w-12 h-12 text-red-500 mb-4" />,
            confirmText: tTable("delete"),
            cancelText: tGeneral("cancel"),
            variant: "destructive",
        });

        if (confirmed) {
            try {
                await deleteMutation.mutateAsync(airComp._id);
                showSuccessToast(t("deleteSuccess"));
            } catch (error) {
                showErrorToast(t("deleteError"));
            }
        }
    };

    const columns: ColumnDef<AirComp>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: t("name"),
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>
        },
        {
            accessorKey: "phone",
            header: t("phone"),
        },
        {
            accessorKey: "address",
            header: t("address"),
        },
    ], [t]);

    const actions = useMemo(() => [
        {
            label: ("View"),
            onClick: onView,
        },
        {
            label: ('Edit'),
            onClick: onEdit,
        },
        {
            label: ('Delete'),
            onClick: handleDelete,
        },
    ], [onEdit, handleDelete]);

    return (
        <div className="space-y-4">
            <div className="flex gap-3 items-center bg-card px-3 rounded-xl justify-between py-3 flex-wrap" >
                <div className="relative w-75  max-w-[500px] ">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={`${tTable("search")}...`}
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9"
                    />

                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("addAirComp")}
                </Button>
            </div>

            <UniTable<AirComp>
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
        </div>
    );
}
