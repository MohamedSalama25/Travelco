"use client";

import * as React from "react";
import {
  IconCamera,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { LanguageSelector } from "@/components/language-selector";
import { CommandMenu } from "@/components/command-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { useCurrentUser } from "@/features/auth/store/authStore";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false);
  const user = useCurrentUser();
  const userRole = user?.role || "employee"; // Default to employee if no role

  // Define permissions for each role
  // admin/manager: access all
  // accountant: access treasury, expenses, air-comps, (maybe dashboard, customers, travelers?)
  // employee: limited access

  // Helper to check permission
  const hasPermission = (allowedRoles?: string[]) => {
    if (!allowedRoles) return true; // Public or available to all auth users
    if (userRole === "admin" || userRole === "manager") return true;
    return allowedRoles.includes(userRole);
  };

  const data = {
    navMain: [
      {
        title: t("nav.dashboard"),
        url: "/dashboard",
        icon: IconDashboard,
        roles: ["admin", "manager", "accountant", "employee"],
      },
      {
        title: t("nav.travelers"),
        url: "/travelers",
        icon: IconUsers,
        roles: ["admin", "manager", "employee", "accountant"],
      },
      {
        title: t("nav.customers"),
        url: "/customers",
        icon: IconUsers,
        roles: ["admin", "manager", "employee", "accountant"],
      },
      {
        title: t("nav.team"),
        url: "/team",
        icon: IconUsers,
        roles: ["admin", "manager"],
      },
      {
        title: t("nav.airComps"),
        url: "/air-comps",
        icon: IconListDetails,
        roles: ["admin", "manager", "accountant"],
      },
      {
        title: t("expenses.title"),
        url: "/expenses",
        icon: IconReport,
        roles: ["admin", "manager", "accountant"],
      },
      {
        title: t("nav.treasury"),
        url: "/treasury",
        icon: IconDatabase,
        roles: ["admin", "manager", "accountant"],
      },
      {
        title: t("nav.advances"),
        url: "/advances",
        icon: IconDatabase,
        roles: ["admin", "manager"],
      },
    ],
    navClouds: [
      {
        title: t("nav.capture"),
        icon: IconCamera,
        isActive: true,
        url: "#",
        items: [
          {
            title: t("nav.activeProposals"),
            url: "#",
          },
          {
            title: t("nav.archived"),
            url: "#",
          },
        ],
      },
      {
        title: t("nav.proposal"),
        icon: IconFileDescription,
        url: "#",
        items: [
          {
            title: t("nav.activeProposals"),
            url: "#",
          },
          {
            title: t("nav.archived"),
            url: "#",
          },
        ],
      },
      {
        title: t("nav.prompts"),
        icon: IconFileAi,
        url: "#",
        items: [
          {
            title: t("nav.activeProposals"),
            url: "#",
          },
          {
            title: t("nav.archived"),
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: t("common.settings"),
        url: "#",
        icon: IconSettings,
        // roles: ["admin", "manager"], // Example restriction
      },
      {
        title: t("common.getHelp"),
        url: "#",
        icon: IconHelp,
      },
      {
        title: t("common.search"),
        url: "#",
        icon: IconSearch,
        onClick: () => setOpen(true),
      },
    ],
    documents: [
      {
        name: t("nav.dataLibrary"),
        url: "#",
        icon: IconDatabase,
        roles: ["admin", "manager"],
      },
      {
        name: t("nav.reports"),
        url: "#",
        icon: IconReport,
        roles: ["admin", "manager", "accountant"],
      },
      {
        name: t("nav.wordAssistant"),
        url: "#",
        icon: IconFileWord,
        roles: ["admin", "manager"],
      },
    ],
  };

  const filteredNavMain = data.navMain.filter(item => hasPermission(item.roles));
  const filteredDocuments = data.documents.filter(item => hasPermission(item.roles));
  // navSecondary usually common, but can filter if needed. Keeping it open for now or filtering settings?
  // Let's filter settings for now just to be safe or keep it open. User didn't specify strict secondary.
  const filteredNavSecondary = data.navSecondary;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 h-[6vh]"
            >
              <Link href="/dashboard">
                <div className="relative w-full h-[6vh]">
                  <Image
                    src="/logo (1).png"
                    alt="Logo"
                    fill
                    className="object-contain"
                  />
                </div>

              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        {/* <NavDocuments items={filteredDocuments} /> */}
        <NavSecondary items={filteredNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <LanguageSelector />
        <NavUser />
      </SidebarFooter>
      <CommandMenu open={open} setOpen={setOpen} />
    </Sidebar>
  );
}
