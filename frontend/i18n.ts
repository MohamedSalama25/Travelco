import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';


const loadMessagesFor = async (locale: string) => {
    try {
        return (await import(`./messages/${locale}.json`)).default;
    } catch (error) {
        // Fallback to default locale if message file is missing
        return (await import(`./messages/${routing.defaultLocale}.json`)).default;
    }
};

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: await loadMessagesFor(locale as string)
    };
});
