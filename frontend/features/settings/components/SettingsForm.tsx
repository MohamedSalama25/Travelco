"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Loader, Save, Building2, Phone, MessageSquare, Map as MapIcon, MapPin } from "lucide-react";
import { toast } from "sonner";
import { clientAxios } from "@/lib/api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import dynamic from "next/dynamic";

const MapSelector = dynamic(() => import("./MapSelector"), {
    ssr: false,
    loading: () => <div className="h-80 bg-muted animate-pulse flex items-center justify-center">Loading Map...</div>
});

export default function SettingsForm() {
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    const queryClient = useQueryClient();
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [tempLocation, setTempLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

    const formSchema = z.object({
        companyName: z.string().min(3, t("companyNameMinLength")),
        address: z.string().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        coordinates: z.object({
            lat: z.number(),
            lng: z.number(),
        }),
    });

    type FormValues = z.infer<typeof formSchema>;

    const { data: settingsData, isLoading: isFetching } = useQuery({
        queryKey: ["companySettings"],
        queryFn: async () => {
            const response = await clientAxios.get(`/settings`);
            return response.data.data;
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyName: "",
            address: "",
            phone: "",
            whatsapp: "",
            coordinates: { lat: 30.0444, lng: 31.2357 },
        },
    });

    // Update form when data arrives
    if (settingsData && !form.getValues("companyName")) {
        form.reset({
            companyName: settingsData.companyName,
            address: settingsData.address || "",
            phone: settingsData.phone || "",
            whatsapp: settingsData.whatsapp || "",
            coordinates: settingsData.coordinates || { lat: 30.0444, lng: 31.2357 },
        });
    }

    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const response = await clientAxios.put(`/settings`, values);
            return response.data;
        },
        onSuccess: () => {
            toast.success(t("saveSuccess"));
            queryClient.invalidateQueries({ queryKey: ["companySettings"] });
        },
        onError: () => {
            toast.error(t("saveError"));
        },
    });

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values);
    };

    const handleConfirmLocation = () => {
        if (tempLocation) {
            form.setValue("coordinates", { lat: tempLocation.lat, lng: tempLocation.lng });
            if (!form.getValues("address")) {
                form.setValue("address", tempLocation.address);
            }
        }
        setIsMapOpen(false);
    };

    if (isFetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <Card className="max-w-4xl mx-auto shadow-lg border-2">

            <CardContent className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            {t("companyName")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("companyName")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {t("phone")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("phone")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="whatsapp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-emerald-600">
                                            <MessageSquare className="h-4 w-4" />
                                            {t("whatsapp")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("whatsapp")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>{t("address")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("addressPlaceholder")} {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            {t("addressDescription")}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="p-4 bg-muted/40 rounded-xl border-2 border-dashed border-muted-foreground/20 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        {t("locationCoordinates")}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {form.getValues("coordinates.lat").toFixed(6)}, {form.getValues("coordinates.lng").toFixed(6)}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsMapOpen(true)}
                                    className="gap-2"
                                >
                                    <MapIcon className="h-4 w-4" />
                                    {t("openMap")}
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" className="px-8 gap-2" disabled={mutation.isPending}>
                                {mutation.isPending ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {tCommon("save")}
                            </Button>
                        </div>
                    </form>
                </Form>

                <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                    <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
                        <DialogHeader className="p-6 pb-0">
                            <DialogTitle className="flex items-center gap-2">
                                <MapIcon className="h-5 w-5 text-primary" />
                                {t("selectLocation")}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-6">
                            <MapSelector
                                value={form.getValues("coordinates")}
                                initialAddress={form.getValues("address")}
                                onChange={(data) => setTempLocation(data)}
                            />
                        </div>
                        <DialogFooter className="p-6 pt-0">
                            <Button variant="outline" onClick={() => setIsMapOpen(false)}>
                                {tCommon("cancel")}
                            </Button>
                            <Button onClick={handleConfirmLocation}>
                                {t("confirmLocation")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
