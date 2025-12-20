'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

const advanceSchema = z.object({
    amount: z.string().min(1, "amountRequired"),
    reason: z.string().min(3, "reasonMin"),
    date: z.string().optional(),
    notes: z.string().optional(),
});

type AdvanceFormData = z.infer<typeof advanceSchema>;

interface AddAdvanceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: AdvanceFormData) => Promise<void>;
}

export default function AddAdvanceDialog({ open, onOpenChange, onSubmit }: AddAdvanceDialogProps) {
    const t = useTranslations("team");
    const tCommon = useTranslations("common");
    const tErrors = useTranslations("customers.formErrors");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<AdvanceFormData>({
        resolver: zodResolver(advanceSchema),
        defaultValues: {
            amount: "",
            reason: "",
            date: new Date().toISOString().split('T')[0],
            notes: ""
        }
    });

    const handleFormSubmit = async (data: AdvanceFormData) => {
        try {
            await onSubmit(data);
            reset();
            onOpenChange(false);
        } catch (error) {
            // Error handled by parent
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("requestAdvance")}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">{t("amount")}</Label>
                        <Input
                            id="amount"
                            type="number"
                            {...register("amount")}
                            className={errors.amount ? "border-destructive" : ""}
                        />
                        {errors.amount && <p className="text-sm text-destructive">{tErrors(errors.amount.message as any)}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">{t("reason")}</Label>
                        <Input
                            id="reason"
                            {...register("reason")}
                            placeholder={t("reason")}
                            className={errors.reason ? "border-destructive" : ""}
                        />
                        {errors.reason && <p className="text-sm text-destructive">{tErrors(errors.reason.message as any)}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">{t("date")}</Label>
                        <Input id="date" type="date" {...register("date")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">{t("notes")}</Label>
                        <Textarea id="notes" {...register("notes")} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
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
