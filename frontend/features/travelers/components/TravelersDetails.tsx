'use client';

import { useTraveler } from '@/features/travelers/hooks/useTravelers';
import { FullScreenLoader } from '@/components/globalComponents/FullScreenLoader';
import Error from '@/components/globalComponents/Error';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export const TravelersDetails = () => {
    const { id } = useParams();
    const t = useTranslations('travelers');
    const tCommon = useTranslations('common');
    const router = useRouter();

    const { data: traveler, isLoading, error } = useTraveler(id as string);

    if (isLoading) return <FullScreenLoader />;
    if (error) return <Error message={tCommon('loadError')} />;
    if (!traveler) return <Error message={tCommon('loadError')} />;

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date(dateString));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{traveler.customer.name}</h1>
                        <p className="text-muted-foreground">{traveler.booking_number}</p>
                    </div>
                    <Badge variant={
                        traveler.status === 'paid' ? 'default' :
                            traveler.status === 'partial' ? 'secondary' :
                                'destructive'
                    }
                        className={
                            traveler.status === 'paid' ? 'bg-green-100 text-green-800' :
                                traveler.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                        }
                    >
                        {t(traveler.status)}
                    </Badge>
                </div>
                <Button variant="outline" className="gap-2">
                    <Printer className="h-4 w-4" />
                    Print
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Trip Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Trip Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
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
                                <p className="text-sm font-medium text-muted-foreground">Airport</p>
                                <p>{traveler.airPort}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('ticketPrice')}</p>
                                <p className="text-lg font-bold">{traveler.ticket_price.toLocaleString()} EGP</p>
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

                {/* Customer Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('name')}</p>
                                <p>{traveler.customer.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('phone')}</p>
                                <p>{traveler.customer.phone}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payments History */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {traveler.payments && traveler.payments.length > 0 ? (
                            <div className="space-y-4">
                                {traveler.payments.map((payment) => (
                                    <div key={payment._id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">{formatDate(payment.payment_date)}</p>
                                            <p className="text-sm text-muted-foreground">{payment.notes || payment.payment_method}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">+{payment.amount.toLocaleString()} EGP</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No payments recorded</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};