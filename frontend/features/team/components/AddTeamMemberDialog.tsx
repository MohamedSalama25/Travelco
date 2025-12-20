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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { teamMemberSchema, type TeamMemberFormData, type TeamMember } from "../types/team";

interface AddTeamMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: TeamMemberFormData) => void;
    member?: TeamMember | null;
}

export default function AddTeamMemberDialog({
    open,
    onOpenChange,
    onSubmit,
    member,
}: AddTeamMemberDialogProps) {
    const t = useTranslations("team");
    const tCommon = useTranslations("common");
    const tCustomers = useTranslations("customers");
    const tErrors = useTranslations("customers.formErrors");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        watch,
    } = useForm<TeamMemberFormData>({
        resolver: zodResolver(teamMemberSchema),
        defaultValues: member
            ? {
                user_name: member.user_name,
                email: member.email,
                phone: member.phone || "",
                role: member.role,
                department: member.department || "",
            }
            : {
                user_name: "",
                email: "",
                phone: "",
                role: "accountant",
                department: "",
                password: "",
            },
    });

    const handleFormSubmit = async (data: TeamMemberFormData) => {
        await onSubmit(data);
        reset();
        onOpenChange(false);
    };

    const handleCancel = () => {
        reset();
        onOpenChange(false);
    };

    const roleValue = watch("role");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {member ? t("editMember") : t("addMember")}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="user_name">
                            {tCustomers("name")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="user_name"
                            {...register("user_name")}
                            placeholder={tCustomers("name")}
                            className={errors.user_name ? "border-destructive" : ""}
                        />
                        {errors.user_name && (
                            <p className="text-sm text-destructive">
                                {tErrors(errors.user_name.message as any)}
                            </p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            {tCustomers("email")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            placeholder={tCustomers("email")}
                            className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">
                                {tErrors(errors.email.message as any)}
                            </p>
                        )}
                    </div>

                    {!member && (
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                {t("password")} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                                placeholder={t("password")}
                                className={errors.password ? "border-destructive" : ""}
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">
                                    {t("passwordError")}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Phone Field */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">
                            {tCustomers("phone")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="phone"
                            {...register("phone")}
                            placeholder={tCustomers("phone")}
                            className={errors.phone ? "border-destructive" : ""}
                        />
                        {errors.phone && (
                            <p className="text-sm text-destructive">
                                {tErrors(errors.phone.message as any)}
                            </p>
                        )}
                    </div>

                    {/* Role Field */}
                    <div className="space-y-2">
                        <Label htmlFor="role">
                            {t("role")} <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={roleValue}
                            onValueChange={(value) => setValue("role", value as any)}
                        >
                            <SelectTrigger id="role">
                                <SelectValue placeholder={t("selectRole")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">{t("admin")}</SelectItem>
                                <SelectItem value="manager">{t("manager")}</SelectItem>
                                <SelectItem value="accountant">{t("accountant")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Department Field */}
                    <div className="space-y-2">
                        <Label htmlFor="department">{t("department")}</Label>
                        <Input
                            id="department"
                            {...register("department")}
                            placeholder={t("department")}
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            {tCommon("cancel")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "..." : tCommon("save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
