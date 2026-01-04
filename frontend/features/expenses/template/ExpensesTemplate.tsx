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
import { DatePicker } from "@/components/globalComponents/date-picker";
import { formatDateToLocal } from "@/lib/dateUtils";
import { format } from "date-fns";
import { Plus, Search, ArrowUpCircle, X, RefreshCcw, Calendar as CalendarIcon } from "lucide-react";
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
import { Label } from "@/components/ui/label";

export default function ExpensesTemplate() {
    const t = useTranslations("expenses");
    const tCommon = useTranslations("common");

    // Filters
    const [filters, setFilters] = useState<ExpenseFilters>({
        page: 1,
        limit: 10,
        search: '',
        fromDate: '',
        toDate: '',
        date: ''
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

    const handleDateChange = (field: 'fromDate' | 'toDate' | 'date', value: string) => {
        setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await deleteMutation.mutateAsync(deleteId);
            toast.success(res.message || t("deleteSuccess"));
            setDeleteId(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("deleteError"));
        }
    };

    const handleFormSubmit = async (data: any) => {
        try {
            if (editingExpense) {
                const res = await updateMutation.mutateAsync({ id: editingExpense._id, data });
                toast.success(res.message || t("updateSuccess"));
            } else {
                const res = await createMutation.mutateAsync(data);
                toast.success(res.message || t("createSuccess"));
            }
            setIsDialogOpen(false);
            setEditingExpense(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || (editingExpense ? t("updateError") : t("createError")));
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingExpense(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                {/* Stats */}
                <Card className="w-[300px]">
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

                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("addExpense")}
                </Button>
            </div>



            {/* Filters */}
            <div className="flex gap-4 items-end flex-wrap justify-between">
                <div>
                    <div className="relative w-75  max-w-[500px] ">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={tCommon("search")}
                            value={filters.search}
                            onChange={handleSearch}
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="flex gap-4 items-end flex-wrap">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground mr-1">{tCommon("fromDate")}</Label>
                        <div className="max-w-[200px]">
                            <DatePicker
                                value={filters.fromDate ? new Date(filters.fromDate) : undefined}
                                onChange={(date) => handleDateChange('fromDate', date ? formatDateToLocal(date) : "")}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground mr-1">{tCommon("toDate")}</Label>
                        <div className="max-w-[200px]">
                            <DatePicker
                                value={filters.toDate ? new Date(filters.toDate) : undefined}
                                onChange={(date) => handleDateChange('toDate', date ? formatDateToLocal(date) : "")}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground mr-1">{tCommon("specificDate")}</Label>
                        <div className="max-w-[200px]">
                            <DatePicker
                                value={filters.date ? new Date(filters.date) : undefined}
                                onChange={(date) => handleDateChange('date', date ? formatDateToLocal(date) : "")}
                            />
                        </div>
                    </div>
                    <Button
                        className="gap-1 bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                        onClick={() => setFilters({ page: 1, limit: 10, search: '', fromDate: '', toDate: '', date: '' })}
                    >
                        <RefreshCcw className="h-4 w-4 " />
                        {tCommon('clearFilters') || 'مسح الفلاتر'}
                    </Button>
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
