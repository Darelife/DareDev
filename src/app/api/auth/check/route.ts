import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('canvas-session');
    const isAuth = session?.value === 'authenticated';

    return NextResponse.json(
      { authenticated: isAuth },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
