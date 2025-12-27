import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAirComps, getAirCompStats, createAirComp, updateAirComp, deleteAirComp, getAirCompDetails, createAirCompPayment } from "../services/airCompService";
import { AirComp } from "../types/types";

export function useAirComps(page: number = 1, limit: number = 10, search?: string) {
    const { data, isLoading, isError, error, isFetching } = useQuery({
        queryKey: ["air-comps", page, limit, search],
        queryFn: () => getAirComps(page, limit, search),
        placeholderData: (previousData) => previousData,
    });

    return {
        data: data?.data || [],
        pagination: data?.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            pages: 0
        },
        isLoading,
        isFetching,
        isError,
        error
    };
}

export function useAirCompStats() {
    return useQuery({
        queryKey: ["air-comps-stats"],
        queryFn: () => getAirCompStats(),
    });
}

export function useAirCompDetails(id: string, ticketsPage = 1, paymentsPage = 1) {
    return useQuery({
        queryKey: ["air-comp-details", id, { ticketsPage, paymentsPage }],
        queryFn: () => getAirCompDetails(id, ticketsPage, paymentsPage),
        enabled: !!id
    });
}

export function useAirCompMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: Omit<AirComp, "_id">) => createAirComp(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["air-comps"] });
            queryClient.invalidateQueries({ queryKey: ["air-comps-stats"] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<AirComp> }) => updateAirComp(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["air-comps"] });
            queryClient.invalidateQueries({ queryKey: ["air-comps-stats"] });
            queryClient.invalidateQueries({ queryKey: ["air-comp-details"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteAirComp(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["air-comps"] });
            queryClient.invalidateQueries({ queryKey: ["air-comps-stats"] });
        },
    });

    const createPaymentMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => createAirCompPayment(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["air-comp-details", id] });
            queryClient.invalidateQueries({ queryKey: ["air-comps-stats"] });
        }
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
        createPaymentMutation
    };
}
