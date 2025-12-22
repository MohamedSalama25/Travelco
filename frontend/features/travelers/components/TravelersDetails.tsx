'use client';

import { useTraveler } from '@/features/travelers/hooks/useTravelers';
import { FullScreenLoader } from '@/components/globalComponents/FullScreenLoader';
import Error from '@/components/globalComponents/Error';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Ban, Info, Wallet, DollarSign, CheckCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CancelTicketDialog } from './CancelTicketDialog';
import { AddPaymentDialog } from './AddPaymentDialog';
import { useQueryClient } from '@tanstack/react-query';
import { refundTraveler } from '../services/travelerService';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils/handleDate';

export const TravelersDetails = () => {
    const { id } = useParams();
    const t = useTranslations('travelers');
    const tCommon = useTranslations('common');
    const router = useRouter();
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
    const [isRefundLoading, setIsRefundLoading] = useState(false);
    const queryClient = useQueryClient();

    const { data: traveler, isLoading, error } = useTraveler(id as string);

    if (isLoading) return <FullScreenLoader />;
    if (error) return <Error message={tCommon('loadError')} />;
    if (!traveler) return <Error message={tCommon('loadError')} />;



    const handleCancelSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['traveler', id] });
    };

    const handleRefund = async () => {
        if (!confirm(t('confirmRefund') || 'هل أنت متأكد من تنفيذ عملية الاسترداد من الخزنة؟')) return;

        setIsRefundLoading(true);
        try {
            await refundTraveler(id as string);
            toast.success(t('refundSuccess') || 'تم تنفيذ الاسترداد بنجاح');
            queryClient.invalidateQueries({ queryKey: ['traveler', id] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'فشل تنفيذ الاسترداد');
        } finally {
            setIsRefundLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{traveler.customer.name}</h1>
                    </div>
                    <Badge variant={
                        traveler.status === 'paid' ? 'default' :
                            traveler.status === 'partial' ? 'secondary' :
                                traveler.status === 'cancel' ? 'destructive' : 'outline'
                    }
                        className={
                            traveler.status === 'paid' ? 'bg-green-100 text-green-800' :
                                traveler.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                    traveler.status === 'cancel' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                        }
                    >
                        {t(traveler.status)}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    {traveler.status !== 'cancel' && traveler.remaining_amount > 0 && (
                        <Button
                            variant="default"
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => setIsPayDialogOpen(true)}
                        >
                            <Wallet className="h-4 w-4" />
                            {t('pay') || 'دفع'}
                        </Button>
                    )}
                    {traveler.status !== 'cancel' && (
                        <Button
                            variant="destructive"
                            className="gap-2"
                            onClick={() => setIsCancelDialogOpen(true)}
                        >
                            <Ban className="h-4 w-4" />
                            {t('cancelTicket') || 'Cancel Ticket'}
                        </Button>
                    )}
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Cancellation Details - Show only if cancelled */}
                {traveler.status === 'cancel' && (
                    <Card className="md:col-span-2 border-red-200 bg-red-50/30">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-red-600" />
                                <CardTitle className="text-red-900">{t('cancellationData') || 'بيانات الإلغاء'}</CardTitle>
                            </div>
                            {traveler.refund_amount > 0 && !traveler.refund_at && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-2"
                                    onClick={handleRefund}
                                    disabled={isRefundLoading}
                                >
                                    <DollarSign className="h-4 w-4" />
                                    {t('processRefund') || 'تنفيذ الاسترداد للعميل'}
                                </Button>
                            )}
                            {traveler.refund_at && (
                                <Badge variant="outline" className="gap-1 border-green-200 bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3" />
                                    {t('refunded') || 'تم الاسترداد'}
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-red-800/60">{t('cancelReason') || 'سبب الإلغاء'}</p>
                                    <p className="text-red-900 font-medium">{traveler.cancel_reason}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-red-800/60">{t('cancelTax') || 'ضريبة الإلغاء'}</p>
                                    <p className="text-red-900 font-medium">{traveler.cancel_tax?.toLocaleString()} EGP</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-red-800/60">{t('cancelCommission') || 'عمولة الإلغاء'}</p>
                                    <p className="text-red-900 font-medium">{traveler.cancel_commission?.toLocaleString()} EGP</p>
                                </div>
                                {traveler.refund_amount > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-red-800/60">{t('refundAmount') || 'مبلغ مستحق للاسترداد'}</p>
                                        <p className="text-red-900 font-bold text-lg">{traveler.refund_amount?.toLocaleString()} EGP</p>
                                        {traveler.refund_at && (
                                            <p className="text-xs text-green-600 mt-1">
                                                {t('refundedAt') || 'تم في'}: {formatDate(traveler.refund_at)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Trip Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('tripDetails')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('bookingNumber')}</p>
                                <p>{traveler.booking_number}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('phone')}</p>
                                <p>{traveler.customer.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('airCompany')}</p>
                                <p>{traveler.air_comp.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('country')}</p>
                                <p>{traveler.country}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('takeOffDate')}</p>
                                <p>{formatDate(traveler.take_off_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('airport')}</p>
                                <p>{traveler.airPort}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('financialDetails')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('ticketPrice')}</p>
                                <p className="text-lg font-bold">{traveler.ticket_price.toLocaleString()} EGP</p>
                                {traveler.status === 'cancel' && traveler.transfer_price_before_cancel && (
                                    <p className="text-xs text-muted-foreground line-through">
                                        {traveler.transfer_price_before_cancel.toLocaleString()} EGP
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('totalPaid')}</p>
                                <p className="text-lg font-bold text-green-600">{traveler.total_paid.toLocaleString()} EGP</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('remaining')}</p>
                                <p className="text-lg font-bold text-red-600">{traveler.remaining_amount.toLocaleString()} EGP</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>


                {/* Payments History */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>{t('paymentHistory')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {traveler.payments && traveler.payments.length > 0 ? (
                            <div className="space-y-4">
                                {traveler.payments.map((payment) => (
                                    <div key={payment._id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 ">
                                        <div>
                                            <p className="font-medium">{formatDate(payment.payment_date)}</p>
                                            <p className="text-sm text-muted-foreground">{payment.notes || t(payment.payment_method)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">+{payment.amount.toLocaleString()} EGP</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">{t('noPayments')}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <CancelTicketDialog
                isOpen={isCancelDialogOpen}
                onClose={() => setIsCancelDialogOpen(false)}
                travelerId={id as string}
                onSuccess={handleCancelSuccess}
            />
            <AddPaymentDialog
                isOpen={isPayDialogOpen}
                onClose={() => setIsPayDialogOpen(false)}
                transferId={id as string}
                remainingAmount={traveler.remaining_amount}
                onSuccess={handleCancelSuccess}
            />
        </div>
    );
};