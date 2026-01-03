"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCurrentUser, useAuthStore } from "@/features/auth/store/authStore";
import { updateProfile } from "@/features/auth/services/authService";

const schema = z.object({
    user_name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    password: z.string().optional(), // Optional, only if changing
});

interface EditProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
    const t = useTranslations("auth"); // Using auth translations or common
    const tCommon = useTranslations("common");
    const user = useCurrentUser();
    const { setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            user_name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            password: "",
        },
    });

    // Reset form when user data changes (e.g. on open or if user updates)
    useEffect(() => {
        if (open && user) {
            form.reset({
                user_name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                password: "",
            });
        }
    }, [user, open, form]);

    const onSubmit = async (data: z.infer<typeof schema>) => {
        setIsLoading(true);
        try {
            const payload: any = {
                user_name: data.user_name,
                email: data.email,
                phone: data.phone,
            };
            if (data.password && data.password.length > 0) {
                payload.password = data.password;
            }

            const res = await updateProfile(payload);

            // Update local store
            if (user) {
                setUser({
                    ...user,
                    name: data.user_name,
                    email: data.email,
                    phone: data.phone
                });
            }

            toast.success("Profile updated successfully");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle>{t("editProfile")}</DialogTitle>
                    <DialogDescription>
                        {t("editProfileDesc")}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="user_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("name")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("name")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("email")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("email")} {...field} />
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
                                    <FormLabel>{t("phone")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("phone")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("password")} ({tCommon("optional") || "اختياري"})</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder={t("password")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                {t("saveChanges")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
