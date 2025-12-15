import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { locale } = await request.json();

        if (!locale || !['en', 'ar'].includes(locale)) {
            return NextResponse.json(
                { error: 'Invalid locale' },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();

        // Set the NEXT_LOCALE cookie that next-intl uses
        cookieStore.set('NEXT_LOCALE', locale, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: 'lax',
        });

        return NextResponse.json({ success: true, locale });
    } catch {
        return NextResponse.json(
            { error: 'Failed to set locale' },
            { status: 500 }
        );
    }
}
