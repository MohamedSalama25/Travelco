export interface TreasuryTransaction {
    _id: string;
    amount: number;
    type: 'in' | 'out';
    description: string;
    relatedModel: 'Transfer' | 'Payment' | 'Expense' | 'Other';
    relatedId?: string;
    createdBy: {
        user_name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface TreasuryStats {
    totalIn: number;
    totalOut: number;
    currentBalance: number;
    netChange: number;
}

export interface TreasuryFilters {
    fromDate?: string;
    toDate?: string;
    type?: 'in' | 'out';
    relatedModel?: string;
    page?: number;
    limit?: number;
}
