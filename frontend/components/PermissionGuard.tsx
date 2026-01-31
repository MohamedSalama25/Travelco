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
    const userRole = user?.role || "accountant"; // Default/Fallback

    // Admin has full access
    if (userRole === "admin") {
        return <>{children}</>;
    }

    if (allowedRoles.includes(userRole)) {
        return <>{children}</>;
    }

    return <NoPermission />;
}
