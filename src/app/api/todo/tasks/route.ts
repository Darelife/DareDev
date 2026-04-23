import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyTodoToken } from '@/lib/todo-auth';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Helper to check auth
async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('todo_session')?.value;
  if (!token || !verifyTodoToken(token)) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  try {
    let query = supabase.from('todo_tasks').select('*').order('task_time', { ascending: true });
    
    if (date) {
      query = query.eq('task_date', date);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    const json = await request.json();
    const { content, type, task_time, task_date } = json;

    if (!content || !type || !task_time || !task_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from('todo_tasks')
      .insert([{ content, type, task_time, task_date }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400, headers: corsHeaders });
    }

    const { error } = await supabase.from('todo_tasks').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    const json = await request.json();
    const { id, ...updates } = json;

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400, headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from('todo_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;

    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
