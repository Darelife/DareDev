import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
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

  // Add CORS headers to API responses
  const response = NextResponse.next();
  
  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*'); // Secure it to specific origin in production if needed
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-canvas-token');
  
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
