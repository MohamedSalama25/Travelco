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
import { useCustomersStore } from "../store/customersStore";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import type { CustomerSchemaType } from "../types/schema";

export function CustomerDialog() {
    const t = useTranslations("customers");
    const {
        isAddDialogOpen,
        isEditDialogOpen,
        selectedCustomer,
        setAddDialogOpen,
        setEditDialogOpen,
    } = useCustomersStore();

    const isOpen = isAddDialogOpen || isEditDialogOpen;
    const isEdit = isEditDialogOpen && !!selectedCustomer;

    const handleClose = () => {
        setAddDialogOpen(false);
        setEditDialogOpen(false);
    };

    const handleSubmit = async (data: CustomerSchemaType) => {
        // if (isEdit && selectedCustomer) {
        //     updateCustomer(
        //         { id: selectedCustomer._id, data },
        //         {
        //             onSuccess: () => {
        //                 showSuccessToast(t("customerUpdated"));
        //                 handleClose();
        //             },
        //             onError: (error: any) => {
        //                 showErrorToast(
        //                     t("updateError"),
        //                     error?.response?.data?.message
        //                 );
        //             },
        //         }
        //     );
        // } else {
        //     createCustomer(data, {
        //         onSuccess: () => {
        //             showSuccessToast(t("customerCreated"));
        //             handleClose();
        //         },
        //         onError: (error: any) => {
        //             showErrorToast(
        //                 t("createError"),
        //                 error?.response?.data?.message
        //             );
        //         },
        //     });
        // }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? t("editCustomer") : t("addCustomer")}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit ? t("editCustomerDesc") : t("addCustomerDesc")}
                    </DialogDescription>
                </DialogHeader>
                <CustomerForm
                    customer={isEdit ? selectedCustomer : undefined}
                    onSubmit={handleSubmit}
                // isLoading={isCreating || isUpdating}
                />
            </DialogContent>
        </Dialog>
    );
}
