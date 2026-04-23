import { NextResponse } from 'next/server';
import { signTodoToken } from '@/lib/todo-auth';

const TODO_PASSWORD = process.env.TODO_PASSWORD || 'darelife123';

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

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === TODO_PASSWORD) {
      const token = signTodoToken();
      
      const response = NextResponse.json({ success: true }, { headers: corsHeaders });
      
      // Set HTTP-Only Cookie
      response.cookies.set('todo_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      
      return response;
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
