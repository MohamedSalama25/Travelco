import ExpensesTemplate from "@/features/expenses/template/ExpensesTemplate";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: "expenses" });
    return {
        title: t("title"),
    };
}

export default function ExpensesPage() {
    return <ExpensesTemplate />;
}
