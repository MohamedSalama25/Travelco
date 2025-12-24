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
            queryClient.invalidateQueries({ queryKey: ['treasury-stats'] }); // Treasury is affected
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateExpense(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-stats'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['treasury-stats'] });
        },
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation
    };
};
