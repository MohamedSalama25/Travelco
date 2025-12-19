import CardHeader, { CardData } from "@/components/globalComponents/CardHeader";
import { useTranslations } from "next-intl";
import { AirCompStats } from "../types/types";
import { useMemo } from "react";

export function AirCompsStats({ stats }: { stats: AirCompStats[] }) {
    const t = useTranslations("airComps");
    const tStats = useTranslations("stats");

    // Aggregate stats if there are multiple entries
    const aggregatedStats = useMemo(() => {
        return stats.reduce((acc, curr) => ({
            ticketsCount: acc.ticketsCount + curr.ticketsCount,
            totalSales: acc.totalSales + curr.totalSales,
            totalCost: acc.totalCost + curr.totalCost,
            totalPaid: acc.totalPaid + curr.totalPaid,
            remainingAmount: acc.remainingAmount + curr.remainingAmount,
            totalProfit: acc.totalProfit + curr.totalProfit,
        }), {
            ticketsCount: 0,
            totalSales: 0,
            totalCost: 0,
            totalPaid: 0,
            remainingAmount: 0,
            totalProfit: 0,
        });
    }, [stats]);

    const cardsData: CardData[] = [
        {
            id: "total-tickets",
            title: t("totalTickets"),
            value: aggregatedStats.ticketsCount.toString(),
            trend: {
                direction: "neutral",
                percentage: 0,
                label: tStats("total")
            }
        },
        {
            id: "total-sales",
            title: t("totalSales"),
            value: `${aggregatedStats.totalSales.toLocaleString()} EGP`,
            trend: {
                direction: "neutral",
                percentage: 0,
                label: tStats("total")
            }
        },
        {
            id: "total-profit",
            title: t("totalProfit"),
            value: `${aggregatedStats.totalProfit.toLocaleString()} EGP`,
            trend: {
                direction: "neutral",
                percentage: 0,
                label: tStats("total")
            }
        },
        {
            id: "remaining-amount",
            title: t("remainingAmount"),
            value: `${aggregatedStats.remainingAmount.toLocaleString()} EGP`,
            trend: {
                direction: "neutral",
                percentage: 0,
                label: tStats("total")
            }
        }
    ];

    return (
        <div>
            <CardHeader cards={cardsData} />
        </div>
    );
}
