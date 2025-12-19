"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSelector } from "./theme-selector";
import { ModeSwitcher } from "./mode-switcher";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  // Extract the main section key
  const segments = pathname.split('/').filter(Boolean);
  const cleanedSegments = segments.filter(seg => seg !== 'ar' && seg !== 'en');
  // Use the first segment as the main section title (e.g. /customers/123 -> customers)
  // Convert kebab-case to camelCase (air-comps -> airComps) to match translation keys
  const rawKey = cleanedSegments.length > 0 ? cleanedSegments[0] : "dashboard";
  const pageKey = rawKey.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

  // Map of potential route names to translation keys if they don't match 1:1 or use a generic fallback
  // For now trying to translate the pageKey directly assuming keys exist in "common" or specific namespaces.
  // Actually, usually titles like "Travelers" are in "common" or sidebar nav.
  // Let's assume common has keys like "travelers", "customers". If not, it will show the key.
  // Ideally we should use a map or switch if keys differ. But dynamic is requested.

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium capitalize">{t(pageKey as any) || pageKey}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSelector />
          <ModeSwitcher />
        </div>
      </div>
    </header>
  );
}
