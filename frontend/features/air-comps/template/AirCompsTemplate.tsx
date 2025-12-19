"use client";

import { useState } from "react";
import { useAirComps, useAirCompStats, useAirCompMutations } from "../hooks/useAirComps";
import { AirCompsTable } from "../components/AirCompsTable";
import { AirCompsStats } from "../components/AirCompsStats";
import { AirCompDialog } from "../components/AirCompDialog";
import { useTranslations } from "next-intl";
import { AirComp } from "../types/types";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { useRouter } from "next/navigation";

export default function AirCompsTemplate() {
    const t = useTranslations("airComps");
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedAirComp, setSelectedAirComp] = useState<AirComp | null>(null);

    const { data, pagination, isLoading } = useAirComps(page, 10, search);
    const { data: statsData } = useAirCompStats();
    const { createMutation, updateMutation } = useAirCompMutations();

    const handleCreate = () => {
        setSelectedAirComp(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (airComp: AirComp) => {
        setSelectedAirComp(airComp);
        setIsDialogOpen(true);
    };

    const handleFormSubmit = async (formData: { name: string; phone: string; address?: string }) => {
        try {
            if (selectedAirComp) {
                await updateMutation.mutateAsync({
                    id: selectedAirComp._id,
                    data: formData
                });
                showSuccessToast(t("updateSuccess"));
            } else {
                await createMutation.mutateAsync(formData);
                showSuccessToast(t("createSuccess"));
            }
        } catch (error) {
            showErrorToast(selectedAirComp ? t("updateError") : t("createError"));
            throw error;
        }
    };

    return (
        <div className="space-y-6">

            {statsData?.data && <AirCompsStats stats={statsData.data} />}

            <AirCompsTable
                data={data}
                pagination={pagination}
                onPageChange={setPage}
                isLoading={isLoading}
                onSearchChange={setSearch}
                onEdit={handleEdit}
                handleCreate={handleCreate}
                onView={(airComp) => {
                    router.push(`/air-comps/${airComp._id}`);
                }}
            />

            <AirCompDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                airComp={selectedAirComp}
                onSubmit={handleFormSubmit}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
