import CardHeader, { CardData } from "@/components/globalComponents/CardHeader";
import { useTranslations } from "next-intl";
import { TravelerStats } from "../types/types";

export function TravelersStats({ stats }: { stats: TravelerStats }) {
    const t = useTranslations("travelers");

    // Transform API stats to CardData format
    const travelersCardsData: CardData[] = [
        {
            id: "active-trips",
            title: t("totalTravelers"),
            value: stats.totalPassengers.value.toString(),
            trend: {
                direction: stats.totalPassengers.trend === 'increase' ? "up" : stats.totalPassengers.trend === 'decrease' ? "down" : "neutral",
                percentage: parseFloat(stats.totalPassengers.percentage),
                label: t("vsLastMonth")
            }
        },
        {
            id: "revenue",
            title: t("totalRevenue"),
            value: `${stats.totalPayments.value.toLocaleString()} ج.م`,
            trend: {
                direction: stats.totalPayments.trend === 'increase' ? "up" : stats.totalPayments.trend === 'decrease' ? "down" : "neutral",
                percentage: parseFloat(stats.totalPayments.percentage),
                label: t("vsLastMonth")
            }
        },
        {
            id: "profit",
            title: t("totalProfit"),
            value: `${stats.totalProfit.value.toLocaleString()} ج.م`,
            trend: {
                direction: stats.totalProfit.trend === 'increase' ? "up" : stats.totalProfit.trend === 'decrease' ? "down" : "neutral",
                percentage: parseFloat(stats.totalProfit.percentage),
                label: t("vsLastMonth")
            }
        },
        {
            id: "cancellations",
            title: t("cancellations"),
            value: stats.overdueTickets.value.toString(),
            trend: {
                direction: stats.overdueTickets.trend === 'increase' ? "up" : stats.overdueTickets.trend === 'decrease' ? "down" : "neutral",
                percentage: parseFloat(stats.overdueTickets.percentage),
                label: t("vsLastMonth")
            }
        }
    ];

    return (
        <div>
            <CardHeader cards={travelersCardsData} />
        </div>
    );
}
