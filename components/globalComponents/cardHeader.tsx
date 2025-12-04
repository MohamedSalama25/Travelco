import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardData {
    id: string;
    title: string;
    value: number | string;
    trend: {
        direction: "up" | "down";
        percentage: number;
        label?: string;
    };
}

interface CardHeaderProps {
    cards: CardData[];
}

export default function CardHeader({ cards }: CardHeaderProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards.map((card) => {
                const isPositive = card.trend.direction === "up";

                return (
                    <div
                        key={card.id}
                        className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                        <h3 className="text-muted-foreground text-sm font-medium mb-4">
                            {card.title}
                        </h3>

                        <div className="flex justify-between items-end">
                            <span className="text-3xl font-bold text-foreground">
                                {card.value}
                            </span>

                            <div className="flex flex-col items-end gap-1">
                                <span
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                                        isPositive
                                            ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                            : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                    )}
                                >
                                    {isPositive ? (
                                        <ArrowUp size={14} />
                                    ) : (
                                        <ArrowDown size={14} />
                                    )}
                                    {card.trend.percentage}%
                                </span>

                                {card.trend.label && (
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {card.trend.label}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}