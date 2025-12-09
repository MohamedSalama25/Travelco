import { z } from "zod";

// User interface
export interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    avatar?: string;
}

// Login schema
export const loginSchema = z.object({
    email: z.string().email({ message: "emailInvalid" }),
    password: z.string().min(6, { message: "passwordMin" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z.object({
    name: z.string().min(2, { message: "nameMin" }),
    email: z.string().email({ message: "emailInvalid" }),
    phone: z.string().min(10, { message: "phoneMin" }),
    password: z.string().min(6, { message: "passwordMin" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Mock users database (stored in localStorage)
export const mockUsers: Array<User & { password: string }> = [
    {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
    },
    {
        id: "2",
        name: "Regular User",
        email: "user@example.com",
        password: "user123",
        role: "user",
    },
];
