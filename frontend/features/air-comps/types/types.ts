export interface AirComp {
    _id: string;
    name: string;
    phone: string;
    address?: string;
}

export interface AirCompStats {
    _id: string;
    name: string;
    phone: string;
    ticketsCount: number;
    totalSales: number;
    totalCost: number;
    totalPaid: number;
    remainingAmount: number;
    totalProfit: number;
}

export interface AirCompResponse {
    success: boolean;
    data: AirComp[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface AirCompStatsResponse {
    success: boolean;
    data: AirCompStats[];
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}
