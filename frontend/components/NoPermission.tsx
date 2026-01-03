import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function NoPermission() {
    const router = useRouter();
    const t = useTranslations("common"); // Assuming 'common' namespace exists, otherwise we'll adjust

    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-4">
                <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">{t("accessDenied")}</h1>
                <p className="text-muted-foreground w-full max-w-[500px]">
                    {t("accessDeniedDesc") || "You do not have permission to access this page. Please contact your administrator if you believe this is an error."}
                </p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.back()}>
                    {t("goBack")}
                </Button>
                <Button onClick={() => router.push("/dashboard")}>
                    {t("goToDashboard")}
                </Button>
            </div>
        </div>
    );
}
