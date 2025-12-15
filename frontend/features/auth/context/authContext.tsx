"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, mockUsers } from "../types/auth";
import Cookies from "js-cookie";

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from cookie on mount
    useEffect(() => {
        const token = Cookies.get("auth_token");
        if (token) {
            try {
                const userData = JSON.parse(atob(token));
                setUser(userData);
            } catch (error) {

                // Cookies.remove("auth_token");
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        // Get users from localStorage or use mock users
        const usersJson = localStorage.getItem("users");
        const users = usersJson ? JSON.parse(usersJson) : mockUsers;

        const foundUser = users.find(
            (u: any) => u.email === email && u.password === password
        );

        if (foundUser) {
            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);

            // Store in cookie (base64 encoded)
            const token = btoa(JSON.stringify(userWithoutPassword));
            Cookies.set("auth_token", token, { expires: 7 }); // 7 days

            return true;
        }

        return false;
    };

    const register = async (name: string, email: string, password: string): Promise<boolean> => {
        // Get existing users
        const usersJson = localStorage.getItem("users");
        const users = usersJson ? JSON.parse(usersJson) : [...mockUsers];

        // Check if email already exists
        if (users.some((u: any) => u.email === email)) {
            return false;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            role: "user" as const,
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        // Auto login
        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);

        // Store in cookie
        const token = btoa(JSON.stringify(userWithoutPassword));
        Cookies.set("auth_token", token, { expires: 7 });

        return true;
    };

    const logout = () => {
        setUser(null);
        Cookies.remove("auth_token");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
