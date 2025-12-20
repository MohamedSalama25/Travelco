import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdvanceService } from "../services/advanceService";

export const useAdvances = (params?: any) => {
    return useQuery({
        queryKey: ['advances', params],
        queryFn: () => AdvanceService.getAdvances(params),
    });
};

export const useCreateAdvance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => AdvanceService.createAdvance(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['advances'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['treasury'] });
        },
    });
};

export const useUpdateAdvanceStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, notes }: { id: string, status: 'approved' | 'rejected', notes?: string }) =>
            AdvanceService.updateAdvanceStatus(id, status, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['advances'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['treasury'] });
        },
    });
};

export const useDeleteAdvance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => AdvanceService.deleteAdvance(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['advances'] });
        },
    });
};
