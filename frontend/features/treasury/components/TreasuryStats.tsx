'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreasuryStats as TreasuryStatsType } from "../types/types";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface TreasuryStatsProps {
    stats: TreasuryStatsType | undefined;
}

export const TreasuryStats = ({ stats }: TreasuryStatsProps) => {
    const t = useTranslations('treasury');

    const statCards = [
        {
            title: t('currentBalance'),
            value: stats?.currentBalance || 0,
            icon: <Wallet className="h-5 w-5 text-blue-600" />,
            bgColor: "bg-blue-50"
        },
        {
            title: t('totalIn'),
            value: stats?.totalIn || 0,
            icon: <TrendingUp className="h-5 w-5 text-green-600" />,
            bgColor: "bg-green-50"
        },
        {
            title: t('totalOut'),
            value: stats?.totalOut || 0,
            icon: <TrendingDown className="h-5 w-5 text-red-600" />,
            bgColor: "bg-red-50"
        },
        {
            title: t('netChange'),
            value: stats?.netChange || 0,
            icon: <ArrowUpRight className="h-5 w-5 text-purple-600" />,
            bgColor: "bg-purple-50"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => (
                <Card key={index}>
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
                            {stat.value.toLocaleString()} <span className="text-xs font-normal">EGP</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
