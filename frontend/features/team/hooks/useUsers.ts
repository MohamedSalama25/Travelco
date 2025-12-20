import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "../services/userService";

export const useUsers = (params?: any) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => UserService.getUsers(params),
    });
};

export const useUserDetails = (id: string) => {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => UserService.getUserDetails(id),
        enabled: !!id,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => UserService.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => UserService.updateUser(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => UserService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
