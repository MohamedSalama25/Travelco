'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useExpenses, useExpenseMutation } from "../hooks/useExpenses";
import { ExpenseFilters, Expense } from "../types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Plus, Search, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ExpenseDialog from "../components/ExpenseDialog";
import { ExpensesTable } from "../components/ExpensesTable";

export default function ExpensesTemplate() {
    const t = useTranslations("expenses");
    const tCommon = useTranslations("common");

    // Filters
    const [filters, setFilters] = useState<ExpenseFilters>({
        page: 1,
        limit: 10,
        search: '',
        fromDate: '',
        toDate: ''
    });

    // Dialogs state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Queries
    const { data: expensesData, isLoading } = useExpenses(filters);
    const { createMutation, updateMutation, deleteMutation } = useExpenseMutation();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    const handleDateChange = (field: 'fromDate' | 'toDate', value: string) => {
        setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteMutation.mutateAsync(deleteId);
            toast.success(t("deleteSuccess"));
            setDeleteId(null);
        } catch (error) {
            toast.error(t("deleteError"));
        }
    };

    const handleFormSubmit = async (data: any) => {
        try {
            if (editingExpense) {
                await updateMutation.mutateAsync({ id: editingExpense._id, data });
                toast.success(t("updateSuccess"));
            } else {
                await createMutation.mutateAsync(data);
                toast.success(t("createSuccess"));
            }
            setIsDialogOpen(false);
            setEditingExpense(null);
        } catch (error) {
            toast.error(editingExpense ? t("updateError") : t("createError"));
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingExpense(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("addExpense")}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("totalExpenses")}
                        </CardTitle>
                        <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expensesData?.stats?.totalAmount || 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={tCommon("search")}
                            value={filters.search}
                            onChange={handleSearch}
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Input
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) => handleDateChange('fromDate', e.target.value)}
                        className="w-[150px]"
                    />
                    <Input
                        type="date"
                        value={filters.toDate}
                        onChange={(e) => handleDateChange('toDate', e.target.value)}
                        className="w-[150px]"
                    />
                </div>
            </div>

            {/* Table */}
            <ExpensesTable
                data={expensesData?.data || []}
                pagination={expensesData?.pagination || { total: 0, page: 1, limit: 10, pages: 0 }}
                onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                isLoading={isLoading}
                isError={false}
                error={null}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteId(id)}
            />

            {/* Pagination Controls could be added here similar to existing tables */}

            {/* Action Dialog */}
            <ExpenseDialog
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleFormSubmit}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                initialData={editingExpense}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{tCommon("areYouSure")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteConfirmDesc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {tCommon("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
