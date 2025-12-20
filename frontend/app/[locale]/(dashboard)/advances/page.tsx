import AdvancesTable from "@/features/team/components/AdvancesTable";
import { useTranslations } from "next-intl";

export default function AdvancesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Advances Management</h1>
                <p className="text-muted-foreground">Approve or reject employee advance requests.</p>
            </div>
            <AdvancesTable />
        </div>
    );
}
