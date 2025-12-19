"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerSchema, type CustomerSchemaType } from "../types/schema";
import { Customer } from "../types/types";

interface CustomerFormProps {
    customer?: Customer;
    onSubmit: (data: CustomerSchemaType) => void;
    isLoading?: boolean;
}

export function CustomerForm({ customer, onSubmit, isLoading }: CustomerFormProps) {
    const t = useTranslations("customers");
    const tErrors = useTranslations("customers.formErrors");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CustomerSchemaType>({
        resolver: zodResolver(customerSchema),
        defaultValues: customer ? {
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            passport_number: customer.passport_number,
            nationality: customer.nationality,
            address: customer.address,
        } : undefined,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                    id="name"
                    {...register("name")}
                    placeholder={t("name")}
                    className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">
                        {tErrors(errors.name.message as any)}
                    </p>
                )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                    id="phone"
                    type="text"
                    {...register("phone")}
                    placeholder={t("phone")}
                    className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                    <p className="text-sm text-red-500">
                        {tErrors(errors.phone.message as any)}
                    </p>
                )}
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder={t("email")}
                    className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                    <p className="text-sm text-red-500">
                        {tErrors(errors.email.message as any)}
                    </p>
                )}
            </div>

            {/* Passport Number */}
            <div className="space-y-2">
                <Label htmlFor="passport_number">{t("passportNumber")}</Label>
                <Input
                    id="passport_number"
                    {...register("passport_number")}
                    placeholder={t("passportNumber")}
                    className={errors.passport_number ? "border-red-500" : ""}
                />
                {errors.passport_number && (
                    <p className="text-sm text-red-500">
                        {tErrors(errors.passport_number.message as any)}
                    </p>
                )}
            </div>

            {/* Nationality */}
            <div className="space-y-2">
                <Label htmlFor="nationality">{t("nationality")}</Label>
                <Input
                    id="nationality"
                    {...register("nationality")}
                    placeholder={t("nationality")}
                    className={errors.nationality ? "border-red-500" : ""}
                />
                {errors.nationality && (
                    <p className="text-sm text-red-500">
                        {tErrors(errors.nationality.message as any)}
                    </p>
                )}
            </div>

            {/* Address */}
            <div className="space-y-2">
                <Label htmlFor="address">{t("address")}</Label>
                <Input
                    id="address"
                    {...register("address")}
                    placeholder={t("address")}
                    className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                    <p className="text-sm text-red-500">
                        {tErrors(errors.address.message as any)}
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? t("saving") : t("save")}
                </Button>
            </div>
        </form>
    );
}
