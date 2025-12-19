import createMiddleware from 'next-intl/middleware';
import { routing } from './routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get auth token from cookies
    const authToken = request.cookies.get('auth_token')?.value;
    const isAuthenticated = !!authToken;

    // Define auth and dashboard paths
    const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
    const isDashboardPage = pathname.includes('/dashboard') ||
        pathname.includes('/customers') ||
        pathname.includes('/travelers') ||
        pathname.includes('/team') ||
        pathname.includes('/about');

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && isAuthPage) {
        const segment = pathname.split('/')[1];
        const locale = ['en', 'ar'].includes(segment) ? segment : 'ar';
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }

    // Redirect unauthenticated users to login
    if (!isAuthenticated && isDashboardPage) {
        const segment = pathname.split('/')[1];
        const locale = ['en', 'ar'].includes(segment) ? segment : 'ar';
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    // Continue with i18n middleware
    return intlMiddleware(request);
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
