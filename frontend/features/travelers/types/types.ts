export interface Traveler {
    _id: string;
    booking_number: string;
    customer: {
        _id: string;
        name: string;
        phone: string;
    };
    air_comp: {
        _id: string;
        name: string;
        phone?: string;
    };
    airPort: string;
    country: string;
    take_off_date: string;
    ticket_salary: number;
    ticket_price: number;
    transfer_pay: number;
    total_paid: number;
    remaining_amount: number;
    status: 'paid' | 'partial' | 'unpaid';
    createdBy?: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
    payments?: Payment[];
}

export interface Payment {
    _id: string;
    transfer: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    receipt_number: string;
    notes: string;
    createdBy: string;
    createdAt: string;
}

export interface StatsItem {
    value: number;
    previous: number;
    change: number;
    percentage: string;
    trend: 'increase' | 'decrease' | 'neutral';
}

export interface Period {
    start: string;
    end: string;
}

export interface TravelerStats {
    totalPassengers: StatsItem;
    totalPayments: StatsItem;
    totalProfit: StatsItem;
    overdueTickets: StatsItem;
}

export interface TravelerStatsResponse {
    success: boolean;
    data: TravelerStats;
    meta: {
        period: {
            current: Period;
            previous: Period;
        }
    };
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface TravelersListResponse {
    success: boolean;
    data: Traveler[];
    pagination: Pagination;
    stats?: TravelerStats;
}

export interface TravelerFilters {
    bookingNumber?: string;
    name?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    createdAt?: string;
}
