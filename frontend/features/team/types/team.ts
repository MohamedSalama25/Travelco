import { z } from "zod";

export type TeamRole = "admin" | "manager" | "accountant";

export interface TeamMember {
    _id: string;
    user_name: string;
    email: string;
    phone?: string;
    role: TeamRole;
    department?: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface Advance {
    _id: string;
    user: string | Partial<TeamMember>;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    date: string;
    approvedBy?: string | Partial<TeamMember>;
    approvedAt?: string;
    notes?: string;
    createdAt: string;
}

export interface UserStats {
    transfers: {
        totalTickets: number;
        totalSales: number;
        totalCost: number;
        totalPaid: number;
        totalRemaining: number;
        totalProfit: number;
        ticketsByStatus: {
            paid: number;
            partial: number;
            unpaid: number;
        };
    };
    payments: {
        totalPayments: number;
        totalPaymentAmount: number;
    };
    customers: {
        totalCustomersCreated: number;
    };
    advances: {
        totalAdvances: number;
    };
}

export interface UserDetailsResponse {
    user: TeamMember;
    transfers: any[];
    advances: Advance[];
    stats: UserStats;
}

// Zod validation schema
export const teamMemberSchema = z.object({
    user_name: z.string()
        .min(2, { message: "nameMin" })
        .max(100, { message: "nameTooLong" }),
    email: z.string()
        .email({ message: "emailInvalid" }),
    phone: z.string()
        .min(10, { message: "phoneInvalid" })
        .max(20, { message: "phoneInvalid" }),
    role: z.enum(["admin", "manager", "accountant"]),
    department: z.string().optional(),
    password: z.string().min(6).optional(),
});

export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;
