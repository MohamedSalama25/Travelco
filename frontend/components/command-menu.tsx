"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    IconDashboard,
    IconUsers,
    IconListDetails,
    IconReport,
    IconDatabase,
} from "@tabler/icons-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"

interface CommandMenuProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function CommandMenu({ open, setOpen }: CommandMenuProps) {
    const router = useRouter()
    const t = useTranslations()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen(!open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [open, setOpen])

    const runCommand = React.useCallback(
        (command: () => void) => {
            setOpen(false)
            command()
        },
        [setOpen]
    )

    const items = [
        {
            title: t("nav.dashboard"),
            url: "/dashboard",
            icon: IconDashboard,
            group: "General",
        },
        {
            title: t("nav.travelers"),
            url: "/travelers",
            icon: IconUsers,
            group: "Core",
        },
        {
            title: t("nav.customers"),
            url: "/customers",
            icon: IconUsers,
            group: "Core",
        },
        {
            title: t("nav.team"),
            url: "/team",
            icon: IconUsers,
            group: "Core",
        },
        {
            title: t("nav.airComps"),
            url: "/air-comps",
            icon: IconListDetails,
            group: "Partners",
        },
        {
            title: t("expenses.title"),
            url: "/expenses",
            icon: IconReport,
            group: "Finances",
        },
        {
            title: t("nav.treasury"),
            url: "/treasury",
            icon: IconDatabase,
            group: "Finances",
        },
        {
            title: t("nav.advances"),
            url: "/advances",
            icon: IconDatabase,
            group: "Finances",
        },
    ]

    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.group]) {
            acc[item.group] = []
        }
        acc[item.group].push(item)
        return acc
    }, {} as Record<string, typeof items>)

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder={t("common.search") + "..."} />
            <CommandList>
                <CommandEmpty>{t("common.noResults") || "No results found."}</CommandEmpty>
                {Object.entries(groupedItems).map(([group, groupItems], index) => (
                    <React.Fragment key={group}>
                        {index > 0 && <CommandSeparator />}
                        <CommandGroup heading={group}>
                            {groupItems.map((item) => (
                                <CommandItem
                                    key={item.url}
                                    onSelect={() => runCommand(() => router.push(item.url))}
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    <span>{item.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </React.Fragment>
                ))}
            </CommandList>
        </CommandDialog>
    )
}
