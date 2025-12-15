'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from 'next-intl';

interface ConfirmOptions {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({
        title: '',
        description: '',
    });
    const resolveRef = useRef<(value: boolean) => void>(null);
    const t = useTranslations('general'); // Assuming general translations exist for default buttons if needed

    const confirm = useCallback((options: ConfirmOptions) => {
        setOptions(options);
        setOpen(true);
        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const handleConfirm = () => {
        setOpen(false);
        if (resolveRef.current) {
            resolveRef.current(true);
        }
    };

    const handleCancel = () => {
        setOpen(false);
        if (resolveRef.current) {
            resolveRef.current(false);
        }
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{options.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {options.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>
                            {options.cancelText || t('cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            className={options.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                        >
                            {options.confirmText || t('confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmDialogProvider');
    }
    return context;
}
