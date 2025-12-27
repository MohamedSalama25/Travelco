
import { API_CONFIG } from "@/lib/api/config";
import { TeamMember } from "../types/team";
import { clientAxios } from "@/lib/api/axios";

export const UserService = {
    getUsers: async (params?: any) => {
        const response = await clientAxios.get(API_CONFIG.ENDPOINTS.USERS.LIST, { params });
        return response.data;
    },

    getUserDetails: async (id: string, page: number = 1) => {
        const response = await clientAxios.get(API_CONFIG.ENDPOINTS.USERS.DETAILS(id), { params: { page } });
        return response.data;
    },

    createUser: async (data: any) => {
        const response = await clientAxios.post(API_CONFIG.ENDPOINTS.USERS.CREATE, data);
        return response.data;
    },

    updateUser: async (id: string, data: any) => {
        const response = await clientAxios.put(API_CONFIG.ENDPOINTS.USERS.UPDATE(id), data);
        return response.data;
    },

    deleteUser: async (id: string) => {
        const response = await clientAxios.delete(API_CONFIG.ENDPOINTS.USERS.DELETE(id));
        return response.data;
    }
};
