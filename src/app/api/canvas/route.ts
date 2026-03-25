import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SessionUser, verifySessionToken } from '@/lib/auth';
import { getServiceSupabaseClient } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

const SESSION_COOKIE = 'canvas-session';

async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

async function hasDrawingAccess(user: SessionUser, drawingId: string): Promise<boolean> {
  if (user.role === 'admin') {
    return true;
  }

  const supabase = getServiceSupabaseClient();
  const { data: drawing, error: drawingError } = await supabase
    .from('drawings')
    .select('id, created_by')
    .eq('id', drawingId)
    .maybeSingle();

  if (drawingError) {
    throw drawingError;
  }

  if (!drawing) {
    return false;
  }

  if (drawing.created_by === user.id) {
    return true;
  }

  const { data: access, error: accessError } = await supabase
    .from('drawing_access')
    .select('id')
    .eq('drawing_id', drawingId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (accessError) {
    throw accessError;
  }

  return !!access;
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit(`canvas:get:${ip}`, 60, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: rate.retryAfterSeconds
            ? { 'Retry-After': String(rate.retryAfterSeconds) }
            : undefined,
        }
      );
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabaseClient();
    const drawingId = request.nextUrl.searchParams.get('id')?.trim();

    if (!drawingId) {
      if (user.role === 'admin') {
        const { data, error } = await supabase
          .from('drawings')
          .select('id, title, created_by, created_at, updated_at')
          .order('updated_at', { ascending: false });

        if (error) {
          throw error;
        }

        return NextResponse.json({ success: true, drawings: data ?? [] }, { status: 200 });
      }

      const { data, error } = await supabase
        .from('drawing_access')
        .select('drawing_id, drawings(id, title, created_by, created_at, updated_at)')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      const drawings =
        data
          ?.map((entry) => entry.drawings)
          .filter((drawing): drawing is NonNullable<typeof drawing> => !!drawing) ?? [];

      return NextResponse.json({ success: true, drawings }, { status: 200 });
    }

    const canAccess = await hasDrawingAccess(user, drawingId);
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('drawings')
      .select('id, title, data, created_by, created_at, updated_at')
      .eq('id', drawingId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: 'Drawing not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        drawing: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Load error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit(`canvas:post:${ip}`, 40, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: rate.retryAfterSeconds
            ? { 'Retry-After': String(rate.retryAfterSeconds) }
            : undefined,
        }
      );
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const saveRate = checkRateLimit(`canvas:save:user:${user.id}`, 1, 10_000);
    if (!saveRate.allowed) {
      return NextResponse.json(
        { error: 'Please wait 10 seconds before saving again' },
        {
          status: 429,
          headers: saveRate.retryAfterSeconds
            ? { 'Retry-After': String(saveRate.retryAfterSeconds) }
            : undefined,
        }
      );
    }

    const supabase = getServiceSupabaseClient();
    const body = await request.json();
    const drawingId = typeof body?.drawingId === 'string' ? body.drawingId.trim() : '';

    if (!drawingId) {
      return NextResponse.json({ error: 'drawingId is required' }, { status: 400 });
    }

    const canAccess = await hasDrawingAccess(user, drawingId);
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const elements = Array.isArray(body?.elements) ? body.elements : [];
    const appState = body?.appState && typeof body.appState === 'object' ? body.appState : {};
    const files = body?.files && typeof body.files === 'object' ? body.files : {};

    const payload = {
      data: { elements, appState, files },
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('drawings')
      .update(payload)
      .eq('id', drawingId)
      .select('id')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: 'Drawing not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: 'Drawing saved', drawingId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
