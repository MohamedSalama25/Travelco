import { useQuery } from "@tanstack/react-query";
import { getTravelers, getTravelerStats } from "../services/travelerService";

export function useTravelers(page: number = 1, search?: string) {
    return useQuery({
        queryKey: ["travelers", page, search],
        queryFn: () => getTravelers(page, search),
    });
}

export function useTravelerStats() {
    return useQuery({
        queryKey: ["travelers-stats"],
        queryFn: () => getTravelerStats(),
    });
}
