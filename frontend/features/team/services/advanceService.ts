
import { clientAxios } from "@/lib/api/axios";
import { API_CONFIG } from "@/lib/api/config";

export const AdvanceService = {
    getAdvances: async (params?: any) => {
        const response = await clientAxios.get(API_CONFIG.ENDPOINTS.ADVANCES.LIST, { params });
        return response.data;
    },

    createAdvance: async (data: any) => {
        const response = await clientAxios.post(API_CONFIG.ENDPOINTS.ADVANCES.CREATE, data);
        return response.data;
    },

    updateAdvanceStatus: async (id: string, status: 'approved' | 'rejected', notes?: string) => {
        const response = await clientAxios.put(API_CONFIG.ENDPOINTS.ADVANCES.UPDATE_STATUS(id), { status, notes });
        return response.data;
    },

    deleteAdvance: async (id: string) => {
        const response = await clientAxios.delete(API_CONFIG.ENDPOINTS.ADVANCES.DELETE(id));
        return response.data;
    }
};
