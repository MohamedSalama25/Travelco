import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, addExpense, updateExpense, deleteExpense } from "../services/expensesService";
import { ExpenseFilters } from "../types/types";

export const useExpenses = (filters: ExpenseFilters) => {
    return useQuery({
        queryKey: ['expenses', filters],
        queryFn: () => getExpenses(filters),
    });
};

export const useExpenseMutation = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: addExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-stats'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-history'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-inventory'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateExpense(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-stats'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-history'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-inventory'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-stats'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-history'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-inventory'] });
        },
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation
    };
};
