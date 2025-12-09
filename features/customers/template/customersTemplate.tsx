"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useCustomers } from "../hooks/useCustomers";
import { useCustomersStore } from "../store/customersStore";
import { CustomerDialog } from "../components/CustomerDialog";
import { Customer } from "../types/types";

export default function CustomersTemplate() {
    const t = useTranslations("customers");
    const {
        searchQuery,
        currentPage,
        pageSize,
        setSearchQuery,
        setCurrentPage,
        setSelectedCustomer,
        setAddDialogOpen,
        setEditDialogOpen,
        setDeleteDialogOpen,
    } = useCustomersStore();

    const { data, isLoading, error } = useCustomers(currentPage, pageSize, searchQuery);

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setEditDialogOpen(true);
    };

    const handleDelete = (customer: Customer) => {
        setSelectedCustomer(customer);
        setDeleteDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t("title")}</h1>
                    <p className="text-muted-foreground">{t("description")}</p>
                </div>
                <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("addCustomer")}
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={t("searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">{t("loading")}</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-center py-12">
                    <p className="text-red-500">{t("loadError")}</p>
                </div>
            )}

            {/* Table */}
            {data && !isLoading && (
                <div className="border rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">{t("name")}</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">{t("email")}</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">{t("phone")}</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">{t("nationality")}</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.data.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3">
                                            <a
                                                href={`/customers/${customer._id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {customer.name}
                                            </a>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {customer.email}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{customer.phone}</td>
                                        <td className="px-4 py-3 text-sm">{customer.nationality}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(customer)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(customer)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {data.pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <p className="text-sm text-muted-foreground">
                                {t("showing")} {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, data.pagination.total)} {t("of")} {data.pagination.total}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    {t("previous")}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === data.pagination.pages}
                                >
                                    {t("next")}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Dialogs */}
            <CustomerDialog />
        </div>
    );
}
