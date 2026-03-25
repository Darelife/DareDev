import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

const SESSION_COOKIE = 'canvas-session';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = token ? verifySessionToken(token) : null;

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({ authenticated: true, user }, { status: 200 });
  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
