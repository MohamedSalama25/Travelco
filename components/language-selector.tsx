"use client";

import * as React from "react";
import { IconLanguage, IconCheck } from "@tabler/icons-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const languages = [
    { code: "en", name: "English", nativeName: "EN" },
    { code: "ar", name: "Arabic", nativeName: "" },
];

export function LanguageSelector() {
    const locale = useLocale();
    const [isPending] = useTransition();
    const [open, setOpen] = React.useState(false);

    const handleLanguageChange = async (newLocale: string) => {
        setOpen(false);

        // Set the locale cookie
        await fetch('/api/locale', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ locale: newLocale }),
        });

        // Navigate to the new locale URL
        const currentPath = window.location.pathname;
        let newPath: string;

        // Remove existing locale prefix if present
        const pathWithoutLocale = currentPath.replace(/^\/(en|ar)(\/|$)/, '/');

        // Add new locale prefix only for non-default locale (ar)
        if (newLocale === 'ar') {
            newPath = `/ar${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
        } else {
            // For English (default), no prefix needed
            newPath = pathWithoutLocale || '/';
        }

        // Navigate to the new URL
        window.location.href = newPath;
    };

    const currentLanguage = languages.find((lang) => lang.code === locale);

    return (
        <></>
        // <Popover open={open} onOpenChange={setOpen}>
        //     <PopoverTrigger asChild>
        //         <Button
        //             variant="ghost"
        //             className="h-8 w-full justify-start gap-2 px-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        //             disabled={isPending}
        //         >
        //             <IconLanguage className="h-4 w-4" />
        //             <span className="flex-1 text-left text-sm">
        //                 {currentLanguage?.nativeName}
        //             </span>
        //         </Button>
        //     </PopoverTrigger>
        //     <PopoverContent
        //         className="w-48 p-2"
        //         align="end"
        //         side="top"
        //         sideOffset={8}
        //     >
        //         <div className="space-y-1">
        //             {languages.map((language) => (
        //                 <Button
        //                     key={language.code}
        //                     variant="ghost"
        //                     className="w-full justify-between"
        //                     onClick={() => handleLanguageChange(language.code)}
        //                 >
        //                     <span>{language.nativeName}</span>
        //                     {locale === language.code && (
        //                         <IconCheck className="h-4 w-4" />
        //                     )}
        //                 </Button>
        //             ))}
        //         </div>
        //     </PopoverContent>
        // </Popover>
    );
}
