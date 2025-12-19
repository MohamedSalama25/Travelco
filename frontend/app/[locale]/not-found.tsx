"use client";

import Link from "next/link";
import { IconError404 } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    const t = useTranslations("notFound");

    return (
        <div className="flex min-h-[calc(100vh-var(--header-height)-3rem)] flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center">
                <IconError404 className="h-32 w-32 text-muted-foreground" />
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        {t("title")}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {t("description")}
                    </p>
                </div>
                <Button asChild size="lg">
                    <Link href="/dashboard">
                        {t("backToHome")}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
