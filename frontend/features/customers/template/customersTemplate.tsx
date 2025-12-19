"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCustomers } from "../hooks/useCustomers";
import { CustomerDialog } from "../components/CustomerDialog";
import CustomersTable from "../components/CustomersTable";
import { FullScreenLoader } from "@/components/globalComponents/FullScreenLoader";
import Error from "@/components/globalComponents/Error";
import { useCustomersStore } from "../store/customersStore";
import { Customer } from "../types/types";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { useQueryClient } from "@tanstack/react-query";
import { deleteCustomer } from "../services/customerService";
import { showSuccessToast } from "@/lib/utils/toast";
import { Trash2 } from "lucide-react";

export default function CustomersTemplate() {
    const t = useTranslations("customers");
    const { customers, pagination, isLoading, isError, error } = useCustomers();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
    const { confirm } = useConfirm();
    const queryClient = useQueryClient();

    if (isLoading) {
        return <FullScreenLoader />;
    }

    if (isError || error) {
        return <Error message={error?.message} />;
    }

    const handleAdd = () => {
        setSelectedCustomer(undefined);
        setIsDialogOpen(true);
    };

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDialogOpen(true);
    };

    const handleDelete = async (customer: Customer) => {
        const confirmed = await confirm({
            title: t("deleteConfirmTitle"),
            description: t("deleteConfirmDesc"),
            icon: <Trash2 className="w-12 h-12 text-red-500 mb-4" />,
            confirmText: t("delete"),
            cancelText: t("cancel"),
            variant: "destructive",
        });

        if (confirmed) {
            try {
                const result = await deleteCustomer(customer._id);
                if (result.success) {
                    queryClient.invalidateQueries({
                        queryKey: ["customers"],
                    });
                    showSuccessToast(t("customerDeleted"));
                }
            } catch (error: any) {
                // Error handling is usually done in the toast or error boundary, 
                // but we can also show a toast here if needed.
                // For now, assuming Global Error Handler or service throws.
                console.error(error);
            }
        }
    };

    return (
        <div className="space-y-6">

            <CustomersTable
                data={customers}
                pagination={pagination}
                isLoading={isLoading}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <CustomerDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                customer={selectedCustomer}
            />
        </div>
    );
}
