import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/auth-service';

export async function GET() {
    const url = getGoogleAuthUrl();
    return NextResponse.redirect(url);
}
