import React from "react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface FullScreenLoaderProps {
    className?: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = React.memo(
    ({ className }) => {
        const t = useTranslations()

        return (
            <div
                className={cn(
                    "absolute inset-0 z-50 rounded-2xl flex items-center justify-center bg-background backdrop-blur-sm transition-colors",
                    className
                )}
                role="alert"
                aria-live="assertive"
            >
                <div className="flex flex-col items-center gap-4 text-center animate-in fade-in zoom-in-90">
                    <div className="relative">
                        <Loader className="animate-spin text-primary" size={48} />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                        {t('general.loading')}
                    </p>
                </div>
            </div>
        );
    }
);

FullScreenLoader.displayName = "FullScreenLoader";
