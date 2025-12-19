"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { CustomerForm } from "./CustomerForm";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import type { CustomerSchemaType } from "../types/schema";
import { createCustomer, updateCustomer } from "../services/customerService";
import { useQueryClient } from "@tanstack/react-query";
import { Customer } from "../types/types";

export function CustomerDialog({
    open,
    onClose,
    customer
}: {
    open: boolean;
    onClose: () => void;
    customer?: Customer;
}) {
    const t = useTranslations("customers");
    const queryClient = useQueryClient();

    const isEdit = open && !!customer;

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = async (data: CustomerSchemaType) => {
        if (isEdit && customer) {

            const result = await updateCustomer(data, customer._id);
            if (result.success) {
                queryClient.invalidateQueries({
                    queryKey: ["customers"],
                });
                showSuccessToast(t("customerUpdated"));
                handleClose();
            }

        } else {
            const result = await createCustomer(data);
            if (result.success) {
                queryClient.invalidateQueries({
                    queryKey: ["customers"],
                });
                showSuccessToast(t("customerCreated"));
                handleClose();
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? t("editCustomer") : t("addCustomer")}
                    </DialogTitle>

                </DialogHeader>
                <CustomerForm
                    key={customer?._id || 'new'}
                    customer={isEdit ? customer : undefined}
                    onSubmit={handleSubmit}
                // isLoading={isCreating || isUpdating}
                />
            </DialogContent>
        </Dialog>
    );
}
