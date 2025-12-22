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

    const layoutStyle: Record<string, string> = {
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
    };

    return (
        <ActiveThemeProvider initialTheme={activeThemeValue}>
            <SidebarProvider style={layoutStyle}>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="p-6 relative min-h-screen">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ActiveThemeProvider>
    );
}
