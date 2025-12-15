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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations();

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: t("nav.dashboard"),
        url: "/dashboard",
        icon: IconDashboard,
      },
      {
        title: t("nav.travelers"),
        url: "/travelers",
        icon: IconUsers,
      },
      {
        title: t("nav.customers"),
        url: "/customers",
        icon: IconUsers,
      },
      {
        title: t("nav.team"),
        url: "/team",
        icon: IconUsers,
      },
      {
        title: t("nav.airComps"),
        url: "/air-comps",
        icon: IconListDetails,
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
      },
    ],
    documents: [
      {
        name: t("nav.dataLibrary"),
        url: "#",
        icon: IconDatabase,
      },
      {
        name: t("nav.reports"),
        url: "#",
        icon: IconReport,
      },
      {
        name: t("nav.wordAssistant"),
        url: "#",
        icon: IconFileWord,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  {t("common.dashboard")}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <LanguageSelector />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
