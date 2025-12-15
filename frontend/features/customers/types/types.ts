/**
 * Customer interface
 */
export interface Customer {
    _id: string;
    name: string;
    phone: string;
    email: string;
    national_id?: string;
    passport_number: string;
    nationality: string;
    address: string;
    notes?: string;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Transfer interface
 */
export interface Transfer {
    _id: string;
    booking_number: string;
    customer: string;
    name: string;
    phone: string;
    air_comp: {
        _id: string;
        name: string;
        phone: string;
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
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Customer form data
 */
export interface CustomerFormData {
    name: string;
    phone: string;
    email: string;
    passport_number: string;
    nationality: string;
    address: string;
}

/**
 * Pagination interface
 */
export interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

/**
 * Customers list response
 */
export interface CustomersListResponse {
    success: boolean;
    data: Customer[];
    can_add?: boolean;
    pagination: Pagination;
}

/**
 * Customer details response
 */
export interface CustomerDetailsResponse {
    success: boolean;
    data: {
        customer: Customer;
        transfers: Transfer[];
        stats: {
            _id: null;
            totalTickets: number;
            totalAmount: number;
            totalPaid: number;
            totalRemaining: number;
        };
    };
    pagination: Pagination;
}
export interface CustomerResponse {
    success: boolean;
    data: Customer;
}
