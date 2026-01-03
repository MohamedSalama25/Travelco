"use client";

import { useForm, Controller } from "react-hook-form";
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
import { DatePicker } from "@/components/globalComponents/date-picker";
import { formatDateToLocal, getTodayLocal } from "@/lib/dateUtils";
import { toast } from "sonner";
import { useAirCompMutations } from "../hooks/useAirComps";
import { Loader } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface AirCompPaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    airCompId: string;
    airCompName: string;
    remainingAmount: number;
}

export default function AirCompPaymentDialog({
    isOpen,
    onClose,
    airCompId,
    airCompName,
    remainingAmount,
}: AirCompPaymentDialogProps) {
    const t = useTranslations("airComps");
    const tTravelers = useTranslations("travelers");
    const tCommon = useTranslations("common");
    const { createPaymentMutation } = useAirCompMutations();
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { isSubmitting },
    } = useForm({
        defaultValues: {
            amount: 0,
            payment_date: getTodayLocal(),
            payment_method: "cash",
            notes: "",
            receipt_number: "",
        },
    });

    const paymentMethod = watch("payment_method");

    const onSubmit = async (data: any) => {
        try {
            const res = await createPaymentMutation.mutateAsync({
                id: airCompId,
                data: {
                    ...data,
                    amount: Number(data.amount),
                },
            });
            toast.success(res.message || tCommon("saveSuccess"));
            queryClient.invalidateQueries({ queryKey: ["air-comps"] });
            queryClient.invalidateQueries({ queryKey: ["air-comps-stats"] });
            queryClient.invalidateQueries({ queryKey: ["air-comp-details"] });
            queryClient.invalidateQueries({ queryKey: ['treasury-history'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-stats'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-inventory'] });
            reset();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || tCommon("saveError"));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("addPaymentTo")} {airCompName}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">{t("amount")}</Label>
                        <Input
                            id="amount"
                            type="number"
                            {...register("amount", { required: true, min: 1 })}
                            placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">
                            {t("remaining")}: {remainingAmount?.toLocaleString()} ج.م
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment_date">{t("date")}</Label>
                        <Controller
                            control={control}
                            name="payment_date"
                            render={({ field }) => (
                                <DatePicker
                                    value={field.value ? new Date(field.value) : undefined}
                                    onChange={(date) => field.onChange(date ? formatDateToLocal(date) : "")}
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment_method">{t("paymentMethod")}</Label>
                        <Select
                            value={paymentMethod}
                            onValueChange={(value) => setValue("payment_method", value)}
                        >
                            <SelectTrigger dir="rtl" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="cash">{tTravelers("cash")}</SelectItem>
                                <SelectItem value="transfer">{tTravelers("transfer")}</SelectItem>
                                <SelectItem value="check">{tTravelers("check") || "شيك"}</SelectItem>
                                <SelectItem value="card">{tTravelers("card")}</SelectItem>
                                <SelectItem value="other">{tCommon("other")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="receipt_number">{t("receiptNumber")}</Label>
                        <Input id="receipt_number" {...register("receipt_number")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">{tCommon("notes")}</Label>
                        <Input id="notes" {...register("notes")} />
                    </div>

                    <DialogFooter>

                        <Button type="submit" disabled={isSubmitting}>
                            {tCommon("pay")}
                            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            {tCommon("cancel")}
                        </Button>

                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
