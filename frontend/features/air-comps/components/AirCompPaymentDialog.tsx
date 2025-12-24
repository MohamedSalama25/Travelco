"use client";

import { useForm } from "react-hook-form";
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
import { toast } from "sonner";
import { useAirCompMutations } from "../hooks/useAirComps";

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

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { isSubmitting },
    } = useForm({
        defaultValues: {
            amount: 0,
            payment_date: new Date().toISOString().split("T")[0],
            payment_method: "cash",
            notes: "",
            receipt_number: "",
        },
    });

    const paymentMethod = watch("payment_method");

    const onSubmit = async (data: any) => {
        try {
            await createPaymentMutation.mutateAsync({
                id: airCompId,
                data: {
                    ...data,
                    amount: Number(data.amount),
                },
            });
            toast.success(tCommon("saveSuccess"));
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
                        <Input
                            id="payment_date"
                            type="date"
                            {...register("payment_date", { required: true })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment_method">{t("paymentMethod")}</Label>
                        <Select
                            value={paymentMethod}
                            onValueChange={(value) => setValue("payment_method", value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
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
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            {tCommon("cancel")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? tCommon("saving") : tCommon("save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
