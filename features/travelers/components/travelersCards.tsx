"use client";

import CardHeader, { CardData } from "@/components/globalComponents/cardHeader";
import { useTranslations } from "next-intl";

export default function TravelersCards() {
    const t = useTranslations("travelers");

    // Mock data for travelers statistics
    const travelersCardsData: CardData[] = [
        {
            id: "active-trips",
            title: t("activeTrips"),
            value: "156",
            trend: {
                direction: "up",
                percentage: 8.3,
                label: t("vsLastMonth")
            }
        },
        {
            id: "completed-trips",
            title: t("completedTrips"),
            value: "1,847",
            trend: {
                direction: "down",
                percentage: 3.2,
                label: t("vsLastMonth")
            }
        },
        {
            id: "revenue",
            title: t("totalRevenue"),
            value: "$45,231",
            trend: {
                direction: "up",
                percentage: 15.7,
                label: t("vsLastMonth")
            }
        },
        {
            id: "avg-rating",
            title: t("avgRating"),
            value: "4.8",
            trend: {
                direction: "up",
                percentage: 2.1,
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