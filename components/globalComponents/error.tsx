'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Error({
    message
}: {
    message?: string;
}) {
    const t = useTranslations()

    return (
        <div className="relative flex h-screen flex-col items-center justify-center space-y-6 overflow-hidden bg-background text-foreground">
            <div className="relative z-10 flex flex-col items-center justify-center space-y-6 p-8 bg-gradient-to-br from-surface to-background rounded-xl shadow-2xl backdrop-blur-sm">
                <AlertTriangle className="h-24 w-24 text-danger animate-[var(--animate-bounce-slow)]" />
                <h2 className="text-5xl font-extrabold tracking-tight text-title-color sm:text-6xl animate-[var(--animate-fade-in-up)]" style={{ animationDelay: '0.7s' }}>
                    {t('general.opps')}
                </h2>
                <p className="text-xl text-secondary-text-color text-center max-w-md leading-relaxed animate-[var(--animate-fade-in-up)]" style={{ animationDelay: '1s' }}>
                    {message || "An unexpected error occurred."}
                </p>
                <button
                    className="mt-6 inline-flex items-center rounded-lg bg-primary px-6 py-3 text-lg font-medium text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-primary-hover hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50 hover:animate-[var(--animate-pulse-hover)]"
                    onClick={() => window.location.reload()}
                >
                    {t('general.tryAgain')}
                </button>
            </div>
        </div>
    );
}
