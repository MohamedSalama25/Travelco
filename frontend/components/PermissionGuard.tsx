"use client";

import { useCurrentUser } from "@/features/auth/store/authStore";
import NoPermission from "./NoPermission";
import { ReactNode } from "react";

interface PermissionGuardProps {
    children: ReactNode;
    allowedRoles: string[];
}

export default function PermissionGuard({ children, allowedRoles }: PermissionGuardProps) {
    const user = useCurrentUser();
    const userRole = user?.role || "employee"; // Default/Fallback

    // Admin and Manager usually have full access, or check specific logic
    if (userRole === "admin" || userRole === "manager") {
        return <>{children}</>;
    }

    if (allowedRoles.includes(userRole)) {
        return <>{children}</>;
    }

    return <NoPermission />;
}
