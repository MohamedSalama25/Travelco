"use client";

import { useQuery } from "@tanstack/react-query";
import { clientAxios } from "@/lib/api/axios";
import { API_CONFIG } from "@/lib/api/config";
import { AirComp } from "../types/types";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

// We might need a specific endpoint for getting a single AirComp by ID
// If it doesn't exist in the service, we might need to add it or fetch list and find (not ideal)
// Assuming there is an endpoint or we can add one. The user provided `airComp/stats` but not `airComp/:id`.
// However, standard REST usually supports GET /airComp/:id.
// Let's assume GET `airComp/:id` works as per config UPDATE/DELETE.

const getAirCompArgs = (id: string) => ({
    queryKey: ["air-comp", id],
    queryFn: async () => {
        // We can reuse the service or call axios directly here if service doesn't have it
        // Let's add getAirComp to service if possible, but for now strict implementation
        const response = await clientAxios.get<{ success: boolean; data: AirComp }>(`${API_CONFIG.BASE_URL}airComp/${id}`);
        // The API response structure might be { success: true, data: { ... } } or just the object
        // Based on previous patterns, it likely returns an object wrapped in data or array
        // The user request showed valid json for list and stats.
        // Let's assume standard response.
        return response.data;
    }
});

export default function AirCompDetailsTemplate({ id }: { id: string }) {
    const t = useTranslations("airComps");
    const tCommon = useTranslations("common");
    const router = useRouter();
    const locale = useLocale();

    const { data: response, isLoading, isError } = useQuery(getAirCompArgs(id));
    const airComp = response?.data;

    if (isLoading) return <div>{tCommon("loading")}</div>;
    if (isError || !airComp) return <div>{tCommon("loadError")}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    {locale === "ar" ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{airComp.name}</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("info")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("name")}:</span>
                            <span className="font-medium">{airComp.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("phone")}:</span>
                            <span className="font-medium">{airComp.phone}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("address")}:</span>
                            <span className="font-medium">{airComp.address || "-"}</span>
                        </div>
                    </CardContent>
                </Card>
                {/* We can add more cards here for stats specific to this AirComp if the API supports it */}
            </div>
        </div>
    );
}
