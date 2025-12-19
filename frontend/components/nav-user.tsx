"use client"

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/context/authContext"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useCurrentUser } from "@/features/auth/store/authStore"
import { useConfirmation } from "@/hooks/useConfirmation"
import { Loader } from "lucide-react"
import { useState } from "react"

export function NavUser() {
  const { isMobile } = useSidebar()
  const t = useTranslations("auth")
  const router = useRouter()
  const { logout } = useAuth();
  const user = useCurrentUser();
  const confirm = useConfirmation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  console.log("user", user)

  const handleLogout = async () => {
    const confirmed = await confirm(
      t("errors.logoutConfirmTitle"),
      t("errors.logoutConfirmDesc"),
      <IconLogout className="w-12 h-12 text-red-500 mb-4" />
    );

    if (confirmed) {
      setIsLoggingOut(true);
      try {
        await logout();
        router.push("/login");
      } finally {
        setIsLoggingOut(false);
      }
    }
  }


  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={"sssss"} alt={user?.name || "sss"} />
                <AvatarFallback className="rounded-lg">
                  {user?.name?.substring(0, 2).toUpperCase() || "sss"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name || "sss"}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={"sss"} alt={user?.name || "sss"} />
                  <AvatarFallback className="rounded-lg">
                    {user?.name?.substring(0, 2).toUpperCase() || "ssss"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-red-600 dark:text-red-400 cursor-pointer flex items-center gap-2"
            >
              {isLoggingOut ? <Loader className="animate-spin w-4 h-4" /> : <IconLogout />}
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
