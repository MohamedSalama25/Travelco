import AdvancesTable from "@/features/team/components/AdvancesTable";
import { useTranslations } from "next-intl";

export default function AdvancesPage() {
    return (
        <div className="space-y-6">
            <AdvancesTable />
        </div>
    );
}
