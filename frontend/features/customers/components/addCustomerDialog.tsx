"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerSchema, type CustomerFormData, type Customer } from "../types/customer";

interface AddCustomerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CustomerFormData) => void;
    customer?: Customer | null;
}

export default function AddCustomerDialog({
    open,
    onOpenChange,
    onSubmit,
    customer,
}: AddCustomerDialogProps) {
    const t = useTranslations("customers");
    const tErrors = useTranslations("customers.formErrors");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: customer
            ? {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                company: customer.company || "",
                address: customer.address || "",
            }
            : {
                name: "",
                email: "",
                phone: "",
                company: "",
                address: "",
            },
    });

    const handleFormSubmit = async (data: CustomerFormData) => {
        onSubmit(data);
        reset();
        onOpenChange(false);
    };

    const handleCancel = () => {
        reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {customer ? t("editCustomer") : t("addCustomer")}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            {t("name")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            {...register("name")}
                            placeholder={t("name")}
                            className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {tErrors(errors.name.message as any)}
                            </p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            {t("email")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            placeholder={t("email")}
                            className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">
                                {tErrors(errors.email.message as any)}
                            </p>
                        )}
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">
                            {t("phone")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="phone"
                            {...register("phone")}
                            placeholder={t("phone")}
                            className={errors.phone ? "border-destructive" : ""}
                        />
                        {errors.phone && (
                            <p className="text-sm text-destructive">
                                {tErrors(errors.phone.message as any)}
                            </p>
                        )}
                    </div>

                    {/* Company Field */}
                    <div className="space-y-2">
                        <Label htmlFor="company">{t("company")}</Label>
                        <Input
                            id="company"
                            {...register("company")}
                            placeholder={t("company")}
                        />
                    </div>

                    {/* Address Field */}
                    <div className="space-y-2">
                        <Label htmlFor="address">{t("address")}</Label>
                        <Input
                            id="address"
                            {...register("address")}
                            placeholder={t("address")}
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            {t("cancel")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "..." : t("save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
