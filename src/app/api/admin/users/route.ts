import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifySessionToken } from '@/lib/auth';
import { getServiceSupabaseClient } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

const SESSION_COOKIE = 'canvas-session';

async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user = token ? verifySessionToken(token) : null;

  if (!user || user.role !== 'admin') {
    return null;
  }

  return user;
}

export async function GET(request: NextRequest) {
  try {
    const rate = checkRateLimit(`admin:users:get:${getClientIp(request.headers)}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, users: data ?? [] }, { status: 200 });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit(`admin:users:post:${ip}`, 15, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const role = body?.role === 'admin' ? 'admin' : 'user';

    if (!username || username.length < 3 || username.length > 50) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 50 characters' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabaseClient();
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const { data, error } = await supabase
      .from('users')
      .insert({ username, password_hash: passwordHash, role })
      .select('id, username, role, created_at')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, user: data }, { status: 201 });
  } catch (error) {
    console.error('Admin users POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
