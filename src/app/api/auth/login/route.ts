import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, signSessionToken } from '@/lib/auth';
import { getServiceSupabaseClient } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

const SESSION_COOKIE = 'canvas-session';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit(`login:${ip}`, 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again shortly.' },
        {
          status: 429,
          headers: rate.retryAfterSeconds
            ? { 'Retry-After': String(rate.retryAfterSeconds) }
            : undefined,
        }
      );
    }

    const body = await request.json();
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabaseClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash, role')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('Login lookup error:', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }

    const isValid =
      !!user &&
      typeof user.password_hash === 'string' &&
      (await comparePassword(password, user.password_hash));

    if (!isValid || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin' && user.role !== 'user') {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 500 });
    }

    const token = signSessionToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
