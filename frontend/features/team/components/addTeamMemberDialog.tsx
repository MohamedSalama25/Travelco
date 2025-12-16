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
                name: member.name,
                email: member.email,
                phone: member.phone,
                role: member.role,
                department: member.department || "",
            }
            : {
                name: "",
                email: "",
                phone: "",
                role: "developer",
                department: "",
            },
    });

    const handleFormSubmit = async (data: TeamMemberFormData) => {
        onSubmit(data);
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
                        <Label htmlFor="name">
                            {tCustomers("name")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            {...register("name")}
                            placeholder={tCustomers("name")}
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
                                <SelectItem value="developer">{t("developer")}</SelectItem>
                                <SelectItem value="designer">{t("designer")}</SelectItem>
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
                            {tCustomers("cancel")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "..." : tCustomers("save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
