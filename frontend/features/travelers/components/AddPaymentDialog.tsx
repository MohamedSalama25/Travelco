'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/globalComponents/date-picker';
import { formatDateToLocal, getTodayLocal } from '@/lib/dateUtils';
import { addPayment } from '../services/travelerService';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface AddPaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    transferId: string;
    remainingAmount: number;
    onSuccess: () => void;
}

export const AddPaymentDialog = ({
    isOpen,
    onClose,
    transferId,
    remainingAmount,
    onSuccess
}: AddPaymentDialogProps) => {
    const t = useTranslations('travelers');
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            amount: remainingAmount,
            payment_method: 'cash',
            notes: '',
            payment_date: getTodayLocal()
        }
    });

    const paymentMethod = watch('payment_method');

    const onSubmit = async (data: any) => {
        if (data.amount <= 0) {
            toast.error(t('amountRequired') || 'Amount must be greater than 0');
            return;
        }

        setIsLoading(true);
        try {
            const res = await addPayment({
                transfer: transferId,
                ...data
            });
            toast.success(res.message || t('paymentSuccess') || 'Payment added successfully');
            queryClient.invalidateQueries({ queryKey: ['traveler-transfers'] });
             queryClient.invalidateQueries({ queryKey: ['travelers'] });
            reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add payment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]" dir="rtl">
                <DialogHeader className='mt-5'>
                    <DialogTitle className="text-right">{t('addPayment') || 'إضافة دفعة'}</DialogTitle>
                    <DialogDescription className="text-right">
                        {t('addPaymentDesc') || 'أدخل تفاصيل الدفعة الجديدة لهذا الحجز.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="amount">{t('amount') || 'المبلغ'}</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="1"
                                max={remainingAmount}
                                {...register('amount', { valueAsNumber: true })}
                                required
                            />
                        </div>
                        <div className="space-y-2 col-span-1">
                            <Label htmlFor="payment_method">{t('paymentMethod') || 'طريقة الدفع'}</Label>
                            <Select
                                value={paymentMethod}
                                onValueChange={(value) => setValue('payment_method', value)}
                            >
                                <SelectTrigger id="payment_method">
                                    <SelectValue placeholder={t('selectMethod') || 'اختر الطريقة'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">{t('cash') || 'نقدي'}</SelectItem>
                                    <SelectItem value="card">{t('card') || 'بطاقة'}</SelectItem>
                                    <SelectItem value="transfer">{t('transfer') || 'تحويل'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payment_date">{t('paymentDate') || 'تاريخ الدفع'}</Label>
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
                        <Label htmlFor="notes">{t('notes') || 'ملاحظات'}</Label>
                        <Textarea
                            id="notes"
                            {...register('notes')}
                            placeholder={t('notesPlaceholder') || 'أدخل ملاحظات إضافية...'}
                        />
                    </div>
                </form>
                <DialogFooter className="flex-row-reverse gap-2">
                    <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isLoading}>
                        إضافة{isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        إلغاء
                    </Button>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
