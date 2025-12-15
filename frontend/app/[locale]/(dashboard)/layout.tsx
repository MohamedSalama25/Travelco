import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ActiveThemeProvider } from "@/components/active-theme";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const activeThemeValue = cookieStore.get("active_theme")?.value;

    return (
        <ActiveThemeProvider initialTheme={activeThemeValue}>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="p-6">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ActiveThemeProvider>
    );
}
