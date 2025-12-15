"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { AirComp } from "../types/types";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AutocompleteSelect } from "@/components/globalComponents/AutoCompleteSelect";


const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AirCompDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    airComp?: AirComp | null;
    onSubmit: (data: FormData) => Promise<void>;
    isSubmitting: boolean;
}

export function AirCompDialog({
    open,
    onOpenChange,
    airComp,
    onSubmit,
    isSubmitting,
}: AirCompDialogProps) {
    const t = useTranslations("airComps");
    const tCommon = useTranslations("common");
    const [userId, setUserId] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            address: "",
        },
    });

    useEffect(() => {
        if (airComp) {
            reset({
                name: airComp.name,
                phone: airComp.phone,
                address: airComp.address || "",
            });
        } else {
            reset({
                name: "",
                phone: "",
                address: "",
            });
        }
    }, [airComp, reset, open]);

    const onFormSubmit = async (data: FormData) => {
        await onSubmit(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {airComp ? t("editAirComp") : t("addAirComp")}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t("name")}</Label>
                        <Input id="name" {...register("name")} />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">{t("phone")}</Label>
                        <Input id="phone" {...register("phone")} />
                        {errors.phone && (
                            <p className="text-sm text-destructive">{errors.phone.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <AutocompleteSelect
                            endpoint="airComp"
                            valueKey="_id"
                            labelKey="name"
                            value={userId}
                            onChange={(val) => setUserId(val)}
                            placeholder="Select user"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">{t("address")}</Label>
                        <Input id="address" {...register("address")} />
                        {errors.address && (
                            <p className="text-sm text-destructive">{errors.address.message}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {tCommon("cancel")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {tCommon("save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
