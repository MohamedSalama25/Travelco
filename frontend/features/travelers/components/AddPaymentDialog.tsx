'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { addPayment } from '../services/travelerService';
import { toast } from 'sonner';

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
    const [formData, setFormData] = useState({
        amount: remainingAmount,
        payment_method: 'cash',
        notes: '',
        payment_date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.amount <= 0) {
            toast.error(t('amountRequired') || 'Amount must be greater than 0');
            return;
        }

        setIsLoading(true);
        try {
            await addPayment({
                transfer: transferId,
                ...formData
            });
            toast.success(t('paymentSuccess') || 'Payment added successfully');
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
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{t('addPayment') || 'إضافة دفعة'}</DialogTitle>
                    <DialogDescription>
                        {t('addPaymentDesc') || 'أدخل تفاصيل الدفعة الجديدة لهذا الحجز.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">{t('amount') || 'المبلغ'}</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="1"
                                max={remainingAmount}
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment_method">{t('paymentMethod') || 'طريقة الدفع'}</Label>
                            <Select
                                value={formData.payment_method}
                                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
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
                        <Input
                            id="payment_date"
                            type="date"
                            value={formData.payment_date}
                            onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">{t('notes') || 'ملاحظات'}</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder={t('notesPlaceholder') || 'أدخل ملاحظات إضافية...'}
                        />
                    </div>
                </form>
                <DialogFooter className="flex-row-reverse gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        {t('cancel') || 'إلغاء'}
                    </Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? t('saving') : t('addPayment')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
