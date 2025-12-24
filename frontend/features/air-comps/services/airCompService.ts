import { clientAxios } from "@/lib/api/axios";
import { API_CONFIG } from "@/lib/api/config";
import { AirComp, AirCompResponse, AirCompStatsResponse } from "../types/types";

export const getAirComps = async (page = 1, limit = 10, search = "") => {
    const response = await clientAxios.get<AirCompResponse>(API_CONFIG.ENDPOINTS.AIRCOMPS.LIST, {
        params: {
            page,
            limit,
            search
        }
    });
    return response.data;
};

export const getAirCompStats = async () => {
    const response = await clientAxios.get<AirCompStatsResponse>(API_CONFIG.ENDPOINTS.AIRCOMPS.STATS);
    return response.data;
};

export const createAirComp = async (data: Omit<AirComp, "_id">) => {
    const response = await clientAxios.post(API_CONFIG.ENDPOINTS.AIRCOMPS.CREATE, data);
    return response.data;
};

export const updateAirComp = async (id: string, data: Partial<AirComp>) => {
    const response = await clientAxios.put(API_CONFIG.ENDPOINTS.AIRCOMPS.UPDATE(id), data);
    return response.data;
};

export const getAirCompDetails = async (id: string, page = 1, limit = 10) => {
    const response = await clientAxios.get(API_CONFIG.ENDPOINTS.AIRCOMPS.DETAILS(id), {
        params: { page, limit }
    });
    return response.data;
};

export const createAirCompPayment = async (id: string, data: any) => {
    const response = await clientAxios.post(API_CONFIG.ENDPOINTS.AIRCOMPS.PAYMENTS(id), data);
    return response.data;
};

export const deleteAirComp = async (id: string) => {
    const response = await clientAxios.delete(API_CONFIG.ENDPOINTS.AIRCOMPS.DELETE(id));
    return response.data;
};
