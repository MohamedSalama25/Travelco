'use client';

import { useTranslations } from 'next-intl';
import { useTravelers, useTravelerStats } from '../hooks/useTravelers';
import { TravelersStats } from '../components/TravelersStats';
import { TravelersTable } from '../components/travelersTable';
import { FullScreenLoader } from '@/components/globalComponents/fullScreenLoader';
import Error from '@/components/globalComponents/error';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TravelerDialog } from '../components/TravelerDialog';
import { createTraveler, updateTraveler } from '../services/travelerService';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast';
import { useQueryClient } from '@tanstack/react-query';

import { Traveler } from '../types/types';
import { TravelerFormData } from '../components/TravelerDialog';

export default function TravelersTemplate() {
    const t = useTranslations('travelers');
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<{
        bookingNumber: string;
        name: string;
        status: string;
        createdAt?: string;
    }>({
        bookingNumber: "",
        name: "",
        status: "all",
        createdAt: ""
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTraveler, setSelectedTraveler] = useState<Traveler | null>(null);
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        travelers,
        pagination,
        isLoading: isTravelersLoading,
        error: travelersError
    } = useTravelers(page, filters);

    const {
        data: statsData,
        isLoading: isStatsLoading,
        error: statsError
    } = useTravelerStats();

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
                await updateTraveler(selectedTraveler._id, data);
                showSuccessToast("Traveler updated successfully"); // Use simple string or translation key if available
            } else {
                await createTraveler(data);
                showSuccessToast("Traveler created successfully");
            }
            queryClient.invalidateQueries({ queryKey: ['travelers-stats'] });
            queryClient.invalidateQueries({ queryKey: ['travelers'] });
            setIsDialogOpen(false);
        } catch (error) {
            showErrorToast("Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isTravelersLoading || isStatsLoading) {
        return <FullScreenLoader />;
    }

    if (travelersError || statsError) {
        return <Error message={t('loadError')} />;
    }

    return (
        <div className="space-y-8">

            {statsData && statsData.success && (
                <TravelersStats stats={statsData.data} />
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