import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Loader2 } from "lucide-react";
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
            date: new Date().toISOString().split('T')[0],
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
                    date: new Date().toISOString().split('T')[0],
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
                                    <FormItem>
                                        <FormLabel>{tCommon("date")}</FormLabel>
                                        <FormControl>
                                            <Input type="date" disabled={isSubmitting} {...field} />
                                        </FormControl>
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
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            {...field}
                                            disabled={isSubmitting}
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{t(`categories.${cat.toLowerCase()}` as any) || cat}</option>
                                            ))}
                                        </select>
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
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                {tCommon("cancel")}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {tCommon("save")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
