export interface Expense {
    _id: string;
    title: string;
    amount: number;
    date: string;
    description?: string;
    category: string;
    createdBy: {
        _id: string;
        user_name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface ExpenseStats {
    totalAmount: number;
}

export interface ExpenseResponse {
    success: boolean;
    data: Expense[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
    stats: ExpenseStats;
}

export interface ExpenseFilters {
    page?: number;
    limit?: number;
    search?: string;
    fromDate?: string;
    toDate?: string;
}
