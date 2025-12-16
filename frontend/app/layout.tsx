import { cookies } from "next/headers";
import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/features/auth/context/authContext";
import { QueryProvider } from "@/lib/providers/queryProvider";
import { Toaster } from "@/components/ui/sonner";
import { AuthInitializer } from "@/features/auth/components/AuthInitializer";
import { ConfirmationDialog } from "@/components/globalComponents/ConfirmationDialog";
import { ConfirmDialogProvider } from "@/components/providers/ConfirmDialogProvider";

export const metadata: Metadata = {
    title: "Orcish Dashboard",
    description:
        "A fully responsive analytics dashboard featuring dynamic charts, interactive tables, a collapsible sidebar, and a light/dark mode theme switcher.",
};

export default async function RootLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale?: string }>;
}>) {
    const resolvedParams = await params;
    const locale = resolvedParams?.locale || 'ar';
    const cookieStore = await cookies();
    const activeThemeValue = cookieStore.get("active_theme")?.value;
    const isScaled = activeThemeValue?.endsWith("-scaled");

    const messages = await getMessages();

    return (
        <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
            <body
                className={cn(
                    "bg-background overscroll-none font-sans antialiased",
                    activeThemeValue ? `theme-${activeThemeValue}` : "",
                    isScaled ? "theme-scaled" : ""
                )}
            >
                <NextIntlClientProvider messages={messages}>
                    <QueryProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                            enableColorScheme
                        >
                            <AuthProvider>
                                <ConfirmDialogProvider>
                                    {children}
                                    <ConfirmationDialog />
                                </ConfirmDialogProvider>
                            </AuthProvider>
                        </ThemeProvider>
                    </QueryProvider>
                </NextIntlClientProvider>
                <AuthInitializer />
                <Toaster />
            </body>
        </html>
    );
}
