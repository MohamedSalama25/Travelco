'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvanceStats } from "../types/team";
import { HandCoins, Undo2, CreditCard, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface AdvancesStatsProps {
    stats: AdvanceStats | undefined;
}

export function AdvancesStats({ stats }: AdvancesStatsProps) {
    const t = useTranslations('team');

    const pendingCount = stats?.byStatus?.find(s => s._id === 'pending')?.count || 0;

    const statCards = [
        {
            title: t('totalDisbursed'),
            value: stats?.totalApproved || 0,
            icon: <HandCoins className="h-5 w-5 text-blue-700" />,
            bgColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
        },
        {
            title: t('totalRepaid'),
            value: stats?.totalRepaid || 0,
            icon: <Undo2 className="h-5 w-5 text-green-700" />,
            bgColor: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
        },
        {
            title: t('outstanding'),
            value: stats?.outstanding || 0,
            icon: <CreditCard className="h-5 w-5 text-red-700" />,
            bgColor: "bg-red-50 dark:bg-red-950/30 dark:text-red-400"
        },
        {
            title: t('pendingAdvances'),
            value: pendingCount,
            icon: <Clock className="h-5 w-5 text-yellow-700" />,
            bgColor: "bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400",
            isCurrency: false
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => (
                <Card key={index} className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-full ${stat.bgColor}`}>
                            {stat.icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stat.value.toLocaleString("en-US")}
                            {stat.isCurrency !== false && <span className="text-xs font-normal ml-1">ج.م</span>}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
