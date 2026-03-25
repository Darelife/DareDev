import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getServiceSupabaseClient } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

const SESSION_COOKIE = 'canvas-session';

type SceneData = {
  elements: unknown[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
};

async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user = token ? verifySessionToken(token) : null;
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}

function normalizeUserIds(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return [...new Set(input.filter((value): value is string => typeof value === 'string' && value.trim().length > 0))];
}

function normalizeSceneData(input: unknown): SceneData {
  if (!input || typeof input !== 'object') {
    return { elements: [], appState: {}, files: {} };
  }

  const data = input as Partial<SceneData>;
  return {
    elements: Array.isArray(data.elements) ? data.elements : [],
    appState: data.appState && typeof data.appState === 'object' ? data.appState : {},
    files: data.files && typeof data.files === 'object' ? data.files : {},
  };
}

export async function GET(request: NextRequest) {
  try {
    const rate = checkRateLimit(`admin:drawings:get:${getClientIp(request.headers)}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from('drawings')
      .select('id, title, created_by, created_at, updated_at, drawing_access(user_id)')
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, drawings: data ?? [] }, { status: 200 });
  } catch (error) {
    console.error('Admin drawings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rate = checkRateLimit(`admin:drawings:post:${getClientIp(request.headers)}`, 20, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const sceneData = normalizeSceneData(body?.data);
    const userIds = normalizeUserIds(body?.userIds);

    const supabase = getServiceSupabaseClient();
    const { data: drawing, error: drawingError } = await supabase
      .from('drawings')
      .insert({
        title: title || null,
        data: sceneData,
        created_by: admin.id,
      })
      .select('id, title, created_by, created_at, updated_at')
      .single();

    if (drawingError) {
      throw drawingError;
    }

    if (userIds.length > 0) {
      const accessRows = userIds.map((userId) => ({ drawing_id: drawing.id, user_id: userId }));
      const { error: accessError } = await supabase.from('drawing_access').insert(accessRows);
      if (accessError) {
        throw accessError;
      }
    }

    return NextResponse.json({ success: true, drawing }, { status: 201 });
  } catch (error) {
    console.error('Admin drawings POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const rate = checkRateLimit(`admin:drawings:put:${getClientIp(request.headers)}`, 20, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const drawingId = typeof body?.drawingId === 'string' ? body.drawingId.trim() : '';
    const userIds = normalizeUserIds(body?.userIds);

    if (!drawingId) {
      return NextResponse.json({ error: 'drawingId is required' }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();
    const { data: drawing, error: drawingError } = await supabase
      .from('drawings')
      .select('id')
      .eq('id', drawingId)
      .maybeSingle();

    if (drawingError) {
      throw drawingError;
    }

    if (!drawing) {
      return NextResponse.json({ error: 'Drawing not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('drawing_access')
      .delete()
      .eq('drawing_id', drawingId);

    if (deleteError) {
      throw deleteError;
    }

    if (userIds.length > 0) {
      const rows = userIds.map((userId) => ({ drawing_id: drawingId, user_id: userId }));
      const { error: insertError } = await supabase.from('drawing_access').insert(rows);
      if (insertError) {
        throw insertError;
      }
    }

    return NextResponse.json({ success: true, drawingId, userIds }, { status: 200 });
  } catch (error) {
    console.error('Admin drawings PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
