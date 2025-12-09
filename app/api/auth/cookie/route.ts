import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const response = NextResponse.json({ success: true });

        // Set cookie with proper settings
        response.cookies.set('auth_token', token, {
            httpOnly: false, // Allow JavaScript access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });

    // Remove cookie
    response.cookies.delete('auth_token');

    return response;
}
