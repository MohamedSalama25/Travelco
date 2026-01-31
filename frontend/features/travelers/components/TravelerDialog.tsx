"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { Traveler } from "../types/types";
import { useEffect, useState } from "react";
import { Loader, Loader2 } from "lucide-react";
import { AutocompleteSelect } from "@/components/globalComponents/AutoCompleteSelect";
import { DateTimePicker } from "@/components/globalComponents/date-time-picker";
import { getTodayLocal } from "@/lib/dateUtils";
import { CustomerDialog } from "../../customers/components/CustomerDialog";
import { AirCompDialog } from "../../air-comps/components/AirCompDialog";
import { useAirCompMutations } from "../../air-comps/hooks/useAirComps";

// Schema matching the requested payload
const formSchema = z.object({
    customer: z.string().min(1, "Customer is required"),
    booking_number: z.string().min(1, "Booking Number is required"),
    air_comp: z.string().min(1, "Air Company is required"),
    airPort: z.string().min(1, "Airport is required"),
    country: z.string().min(1, "Country is required"),
    take_off_date: z.union([z.string(), z.date()]).refine(val => !!val, "Take off date is required"),
    ticket_salary: z.coerce.number().min(0, "Must be positive"),
    ticket_price: z.coerce.number().min(0, "Must be positive"),
    transfer_pay: z.coerce.number().min(0, "Must be positive"),
});

export type TravelerFormData = z.infer<typeof formSchema>;

interface TravelerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    traveler?: Traveler | null;
    onSubmit: (data: TravelerFormData) => Promise<void>;
    isSubmitting: boolean;
}

export function TravelerDialog({
    open,
    onOpenChange,
    traveler,
    onSubmit,
    isSubmitting,
}: TravelerDialogProps) {
    const t = useTranslations("travelers");
    const tCommon = useTranslations("common");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm<TravelerFormData>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            customer: "",
            booking_number: "",
            air_comp: "",
            airPort: "",
            country: "",
            take_off_date: new Date(),
            ticket_salary: 0,
            ticket_price: 0,
            transfer_pay: 0,
        },
    });

    // Watch values for AutocompleteSelect controlled components
    const customerValue = watch("customer");
    const airCompValue = watch("air_comp");

    useEffect(() => {
        if (traveler) {
            // Flatten nested objects for the form
            reset({
                customer: traveler.customer?._id || "",
                booking_number: traveler.booking_number || "",
                air_comp: traveler.air_comp?._id || "",
                airPort: traveler.airPort || "",
                country: traveler.country || "",
                take_off_date: traveler.take_off_date ? new Date(traveler.take_off_date) : new Date(),
                ticket_salary: traveler.ticket_salary || 0,
                ticket_price: traveler.ticket_price || 0,
                transfer_pay: traveler.transfer_pay || 0,
            });
        } else {
            reset({
                customer: "",
                booking_number: "",
                air_comp: "",
                airPort: "",
                country: "",
                take_off_date: new Date(),
                ticket_salary: 0,
                ticket_price: 0,
                transfer_pay: 0,
            });
        }
    }, [traveler, reset, open]);

    const onFormSubmit = async (data: TravelerFormData) => {
        await onSubmit(data);
        onOpenChange(false);
    };

    // Sub-dialog states for Quick Add
    const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
    const [airCompDialogOpen, setAirCompDialogOpen] = useState(false);

    const { createMutation: createAirCompMutation } = useAirCompMutations();

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="mt-4">
                        <DialogTitle className="text-right">
                            {traveler ? t("editTicket") : t("addTicket")}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">

                        {/* Customer Selection */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>{t("customer")}</Label>
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto text-primary"
                                    onClick={() => setCustomerDialogOpen(true)}
                                >
                                    + {t("addQuick")}
                                </Button>
                            </div>
                            <AutocompleteSelect
                                endpoint="customers"
                                valueKey="_id"
                                labelKey="name"
                                value={customerValue}
                                onChange={(val) => {
                                    setValue("customer", val);
                                }}
                                placeholder={t("selectCustomer")}
                            />
                            {errors.customer && (
                                <p className="text-sm text-destructive">{errors.customer.message}</p>
                            )}
                        </div>

                        {/* Booking Number */}
                        <div className="space-y-2">
                            <Label>{t("bookingNumber")}</Label>
                            <Input {...register("booking_number")} />
                            {errors.booking_number && (
                                <p className="text-sm text-destructive">{errors.booking_number.message}</p>
                            )}
                        </div>

                        {/* AirComp Selection */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>{t("airComp")}</Label>
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto text-primary"
                                    onClick={() => setAirCompDialogOpen(true)}
                                >
                                    + {t("addQuick")}
                                </Button>
                            </div>
                            <AutocompleteSelect
                                endpoint="airComp"
                                valueKey="_id"
                                labelKey="name"
                                value={airCompValue}
                                onChange={(val) => setValue("air_comp", val)}
                                placeholder={t("selectAirComp")}
                            />
                            {errors.air_comp && (
                                <p className="text-sm text-destructive">{errors.air_comp.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="airPort">{t("airport")}</Label>
                                <Input id="airPort" {...register("airPort")} />
                                {errors.airPort && (
                                    <p className="text-sm text-destructive">{errors.airPort.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">{t("country")}</Label>
                                <Input id="country" {...register("country")} />
                                {errors.country && (
                                    <p className="text-sm text-destructive">{errors.country.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="take_off_date">{t("takeOffDate")}</Label>
                            <Controller
                                control={control}
                                name="take_off_date"
                                render={({ field }) => (
                                    <DateTimePicker
                                        value={field.value ? new Date(field.value) : undefined}
                                        onChange={(date) => field.onChange(date)}
                                    />
                                )}
                            />
                            {errors.take_off_date && (
                                <p className="text-sm text-destructive">{errors.take_off_date.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ticket_salary">{t("ticketSalary")}</Label>
                                <Input type="number" id="ticket_salary" {...register("ticket_salary")} />
                                {errors.ticket_salary && (
                                    <p className="text-sm text-destructive">{errors.ticket_salary.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ticket_price">{t("ticketPrice")}</Label>
                                <Input type="number" id="ticket_price" {...register("ticket_price")} />
                                {errors.ticket_price && (
                                    <p className="text-sm text-destructive">{errors.ticket_price.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="transfer_pay">{t("transferPay")}</Label>
                                <Input type="number" id="transfer_pay" {...register("transfer_pay")} />
                                {errors.transfer_pay && (
                                    <p className="text-sm text-destructive">{errors.transfer_pay.message}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>

                                {tCommon("save")}
                                {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {tCommon("cancel")}
                            </Button>

                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Quick Add Dialogs */}
            <CustomerDialog
                open={customerDialogOpen}
                onClose={() => setCustomerDialogOpen(false)}
                onSuccess={(newCustomer) => {
                    setValue("customer", newCustomer._id);
                }}
            />

            <AirCompDialog
                open={airCompDialogOpen}
                onOpenChange={setAirCompDialogOpen}
                isSubmitting={createAirCompMutation.isPending}
                onSubmit={async (data) => {
                    await createAirCompMutation.mutateAsync(data, {
                        onSuccess: (result: any) => {
                            if (result.data?._id) {
                                setValue("air_comp", result.data._id);
                            }
                        }
                    });
                }}
            />
        </>
    );
}
