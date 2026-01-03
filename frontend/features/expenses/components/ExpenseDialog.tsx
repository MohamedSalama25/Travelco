import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/globalComponents/date-picker";
import { formatDateToLocal, getTodayLocal } from "@/lib/dateUtils";
import { Loader } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Expense } from "../types/types";

// Define categories (can be dynamic later)
const CATEGORIES = ['General', 'Office', 'Salaries', 'Rent', 'Utilities', 'Maintenance', 'Marketing', 'Other'];

interface ExpenseDialogProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly onSubmit: (data: any) => Promise<void>;
    readonly isSubmitting: boolean;
    readonly initialData?: Expense | null;
}

const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be greater than 0",
    }),
    date: z.string(), // Input type date returns string YYYY-MM-DD
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
});

export default function ExpenseDialog({ isOpen, onClose, onSubmit, isSubmitting, initialData }: ExpenseDialogProps) {
    const t = useTranslations("expenses"); // We will add this namespace
    const tCommon = useTranslations("common");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            amount: "",
            date: getTodayLocal(),
            description: "",
            category: "General",
        },
    });

    // Reset form when dialog opens/closes or data changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                form.reset({
                    title: initialData.title,
                    amount: String(initialData.amount),
                    date: new Date(initialData.date).toISOString().split('T')[0],
                    description: initialData.description || "",
                    category: initialData.category,
                });
            } else {
                form.reset({
                    title: "",
                    amount: "",
                    date: getTodayLocal(),
                    description: "",
                    category: "General",
                });
            }
        }
    }, [isOpen, initialData, form]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        await onSubmit({
            ...values,
            amount: Number(values.amount),
        });
        onClose();
    };

    const title = initialData ? t("editExpense") : t("addExpense");

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("expenseTitle")}</FormLabel>
                                    <FormControl>
                                        <Input disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("amount")}</FormLabel>
                                        <FormControl>
                                            <Input type="number" disabled={isSubmitting} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{tCommon("date")}</FormLabel>
                                        <DatePicker
                                            value={field.value ? new Date(field.value) : undefined}
                                            onChange={(date) => field.onChange(date ? formatDateToLocal(date) : "")}
                                            disabled={isSubmitting}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("category")}</FormLabel>
                                    <FormControl>
                                        <Select
                                            disabled={isSubmitting}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="w-full" dir="rtl">
                                                <SelectValue placeholder={t("category")} />
                                            </SelectTrigger>
                                            <SelectContent dir="rtl">
                                                {CATEGORIES.map(cat => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {t(`categories.${cat.toLowerCase()}` as any) || cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("description")}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="resize-none"
                                            disabled={isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {tCommon("save")}
                                {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}

                            </Button>

                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                {tCommon("cancel")}
                            </Button>

                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
