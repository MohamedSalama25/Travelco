import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { notFound } from 'next/navigation';
import { ActiveThemeProvider } from "@/components/active-theme";
import { AuthProvider } from "@/features/auth/context/authContext";

const locales = ['en', 'ar'];

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || 'en';

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    notFound();
  }

  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get("active_theme")?.value;

  return (
    <ActiveThemeProvider initialTheme={activeThemeValue}>
      <AuthProvider>
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
      </AuthProvider>

    </ActiveThemeProvider>
  );
}
