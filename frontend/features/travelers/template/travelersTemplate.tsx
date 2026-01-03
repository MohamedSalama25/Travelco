'use client';

import { useTranslations } from 'next-intl';
import { useTravelers } from '../hooks/useTravelers';
import { TravelersStats } from '../components/TravelersStats';
import { TravelersTable } from '../components/TravelersTable';
import { FullScreenLoader } from "@/components/globalComponents/FullScreenLoader";
import Error from "@/components/globalComponents/Error";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TravelerDialog } from '../components/TravelerDialog';
import { createTraveler, updateTraveler } from '../services/travelerService';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast';
import { useQueryClient } from '@tanstack/react-query';

import { Traveler } from '../types/types';
import { TravelerFormData } from '../components/TravelerDialog';
import { customersKeys } from '@/features/customers/hooks/useCustomers';

export default function TravelersTemplate() {
    const t = useTranslations('travelers');
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<{
        bookingNumber: string;
        name: string;
        status: string;
        fromDate?: string;
        toDate?: string;
        takeOffDate?: string;
    }>({
        bookingNumber: "",
        name: "",
        status: "all",
        fromDate: "",
        toDate: "",
        takeOffDate: ""
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTraveler, setSelectedTraveler] = useState<Traveler | null>(null);
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        travelers,
        pagination,
        isLoading: isTravelersLoading,
        error: travelersError,
        stats
    } = useTravelers(page, filters);


    const handleCreate = () => {
        setSelectedTraveler(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (traveler: Traveler) => {
        setSelectedTraveler(traveler);
        setIsDialogOpen(true);
    };

    const handleFormSubmit = async (data: TravelerFormData) => {
        try {
            setIsSubmitting(true);
            if (selectedTraveler) {
                const res = await updateTraveler(selectedTraveler._id, data);
                queryClient.invalidateQueries({ queryKey: ['traveler', selectedTraveler._id] });
                showSuccessToast(res.message || "تم تعديل التذكرة بنجاح ");
            } else {
                const res = await createTraveler(data);
                showSuccessToast(res.message || "تم اضافة التذكرة بنجاح ");
            }
            queryClient.invalidateQueries({ queryKey: ['travelers'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-history'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-stats'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-inventory'] });
            queryClient.invalidateQueries({ queryKey: ["air-comps"] });
            queryClient.invalidateQueries({ queryKey: ["air-comps-stats"] });
            queryClient.invalidateQueries({ queryKey: ["air-comp-details"] });
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            if (selectedTraveler) {
                queryClient.invalidateQueries({
                    queryKey: customersKeys.detail(selectedTraveler.customer._id, 1),
                });
            }
            setIsDialogOpen(false);

        } catch (error: any) {
            showErrorToast(error.response?.data?.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isTravelersLoading) {
        return <FullScreenLoader />;
    }

    if (travelersError) {
        return <Error message={t('loadError')} />;
    }

    return (
        <div className="space-y-8">

            {stats && (
                <TravelersStats stats={stats} />
            )}

            {travelers && (
                <TravelersTable
                    data={travelers}
                    pagination={pagination}
                    onPageChange={setPage}
                    isLoading={isTravelersLoading}
                    filters={filters}
                    onFilterChange={setFilters}
                    handleCreate={handleCreate}
                    onEdit={handleEdit}
                />
            )}

            <TravelerDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                traveler={selectedTraveler}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
            />

            {/* Pagination Controls could be added here reusing logic from Customers */}
        </div>
    );
}