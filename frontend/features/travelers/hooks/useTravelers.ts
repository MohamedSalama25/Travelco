import { useQuery } from "@tanstack/react-query";
import { getTravelers, getTraveler } from "../services/travelerService";
import { TravelerFilters } from "../types/types";

export function useTravelers(page: number = 1, filters?: TravelerFilters) {
    const { data, isLoading, isError, error, isFetching } = useQuery({
        queryKey: ["travelers", page, filters],
        queryFn: () => getTravelers(page, filters),
        placeholderData: (previousData) => previousData,
    });

    return {
        travelers: data?.data || [],
        pagination: data?.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            pages: 0
        },
        stats: data?.stats,
        isLoading,
        isFetching,
        isError,
        error
    };
}



export function useTraveler(id: string) {
    return useQuery({
        queryKey: ["traveler", id],
        queryFn: () => getTraveler(id),
        enabled: !!id,
    });
}
