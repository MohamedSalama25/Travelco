import { z } from "zod";

// Role enum
export type TeamRole = "admin" | "manager" | "developer" | "designer";

// Zod validation schema
export const teamMemberSchema = z.object({
    name: z.string()
        .min(2, { message: "nameMin" })
        .max(100, { message: "nameTooLong" }),
    email: z.string()
        .email({ message: "emailInvalid" }),
    phone: z.string()
        .min(10, { message: "phoneInvalid" })
        .max(20, { message: "phoneInvalid" }),
    role: z.enum(["admin", "manager", "developer", "designer"]),
    department: z.string().optional(),
});

export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: TeamRole;
    department?: string;
    joinDate: string;
    isArchived?: boolean;
}

// Mock Data
export const mockTeamMembers: TeamMember[] = [
    {
        id: "1",
        name: "أحمد محمد",
        email: "ahmed.mohamed@company.com",
        phone: "+20 100 123 4567",
        role: "admin",
        department: "الإدارة",
        joinDate: "2022-01-15",
    },
    {
        id: "2",
        name: "Sarah Williams",
        email: "sarah.w@company.com",
        phone: "+1 555 234 5678",
        role: "manager",
        department: "Operations",
        joinDate: "2022-03-20",
    },
    {
        id: "3",
        name: "محمود علي",
        email: "mahmoud.ali@company.com",
        phone: "+966 50 987 6543",
        role: "developer",
        department: "التطوير",
        joinDate: "2022-06-10",
    },
    {
        id: "4",
        name: "Emma Chen",
        email: "emma.chen@company.com",
        phone: "+86 138 1234 5678",
        role: "designer",
        department: "Design",
        joinDate: "2022-08-05",
    },
    {
        id: "5",
        name: "فاطمة حسن",
        email: "fatima.hassan@company.com",
        phone: "+971 50 111 2222",
        role: "developer",
        department: "التطوير",
        joinDate: "2023-01-12",
    },
    {
        id: "6",
        name: "James Anderson",
        email: "j.anderson@company.com",
        phone: "+44 7700 900123",
        role: "manager",
        department: "Marketing",
        joinDate: "2023-02-18",
    },
    {
        id: "7",
        name: "ليلى محمود",
        email: "layla.mahmoud@company.com",
        phone: "+20 111 555 7777",
        role: "designer",
        department: "التصميم",
        joinDate: "2023-04-22",
    },
    {
        id: "8",
        name: "Michael Brown",
        email: "m.brown@company.com",
        phone: "+1 555 876 5432",
        role: "developer",
        department: "Engineering",
        joinDate: "2023-06-30",
    },
    {
        id: "9",
        name: "نور الدين",
        email: "noureldeen@company.com",
        phone: "+971 55 333 4444",
        role: "manager",
        department: "المبيعات",
        joinDate: "2023-09-14",
    },
    {
        id: "10",
        name: "Sophie Martin",
        email: "sophie.m@company.com",
        phone: "+33 6 12 34 56 78",
        role: "designer",
        department: "Creative",
        joinDate: "2023-11-08",
    },
];
