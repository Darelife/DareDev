import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function isAuthenticated(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('canvas-session');
  return session?.value === 'authenticated';
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('drawings')
      .select('data, updated_at')
      .eq('id', 'default-canvas')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to load drawing' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        drawing: data || {
          elements: [],
          appState: { collaborators: new Map() },
        },
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
    if (!(await isAuthenticated(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { elements, appState, files } = await request.json();

    const istTime = new Date(
      new Date().getTime() + 5.5 * 60 * 60 * 1000
    ).toISOString();

    const scene = { elements, appState, files };

    const { error } = await supabase
      .from('drawings')
      .upsert(
        {
          id: 'default-canvas',
          data: scene,
          updated_at: istTime,
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Save error:', error);
      return NextResponse.json(
        { error: 'Failed to save drawing' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Drawing saved', savedAt: istTime },
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
