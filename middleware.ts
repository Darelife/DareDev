import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fast pre-check: canvas endpoints require a session cookie.
  // Token validity and role checks happen inside route handlers.
  if (pathname.startsWith('/api/canvas')) {
    const session = request.cookies.get('canvas-session');

    if (!session?.value) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
