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
import { Checkbox } from '@/components/ui/checkbox';

import { cancelTraveler } from '../services/travelerService';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface CancelTicketDialogProps {
    isOpen: boolean;
    onClose: () => void;
    travelerId: string;
    onSuccess: () => void;
}

export const CancelTicketDialog = ({
    isOpen,
    onClose,
    travelerId,
    onSuccess
}: CancelTicketDialogProps) => {
    const t = useTranslations('travelers');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        cancel_reason: '',
        cancel_tax: 0,
        cancel_commission: 0,
        is_refunded: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.cancel_reason) {
            toast.error(t('cancelReasonRequired') || 'Cancellation reason is required');
            return;
        }

        setIsLoading(true);
        try {
            await cancelTraveler(travelerId, formData);
            toast.success(t('cancelSuccess') || 'Ticket cancelled successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to cancel ticket');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{t('cancelTicket') || 'إلغاء التذكرة'}</DialogTitle>
                    <DialogDescription>
                        {t('cancelTicketDesc') || 'أدخل بيانات إلغاء التذكرة. سيتم إعادة حساب البيانات المالية.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="cancel_reason">{t('cancelReason') || 'سبب الإلغاء'}</Label>
                        <Textarea
                            id="cancel_reason"
                            value={formData.cancel_reason}
                            onChange={(e) => setFormData({ ...formData, cancel_reason: e.target.value })}
                            placeholder={t('cancelReasonPlaceholder') || 'أدخل سبب الإلغاء...'}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cancel_tax">{t('cancelTax') || 'ضريبة الإلغاء'}</Label>
                            <Input
                                id="cancel_tax"
                                type="number"
                                min="0"
                                value={formData.cancel_tax}
                                onChange={(e) => setFormData({ ...formData, cancel_tax: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cancel_commission">{t('cancelCommission') || 'عمولة الإلغاء'}</Label>
                            <Input
                                id="cancel_commission"
                                type="number"
                                min="0"
                                value={formData.cancel_commission}
                                onChange={(e) => setFormData({ ...formData, cancel_commission: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse border p-4 rounded-lg bg-muted/30">
                        <Checkbox
                            id="is_refunded"
                            checked={formData.is_refunded}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, is_refunded: checked as boolean })
                            }
                        />
                        <div className="grid gap-1.5 leading-none px-2">
                            <Label
                                htmlFor="is_refunded"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {t('confirmRefundAmount') || 'تم استرداد المبلغ للعميل'}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {t('refundNote') || 'سيتم خصم المبلغ المستحق للاسترداد من الخزنة فوراً.'}
                            </p>
                        </div>
                    </div>
                </form>
                <DialogFooter className="flex-row-reverse gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        {t('cancel') || 'إلغاء'}
                    </Button>
                    <Button type="submit" variant="destructive" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (t('cancelling') || 'جاري الإلغاء...') : (t('confirmCancel') || 'تأكيد الإلغاء')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
