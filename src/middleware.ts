import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 保护需要认证的路由
  if (pathname.startsWith('/dashboard')) {
    // TODO: 检查用户认证状态
    // 如果未认证，重定向到登录页面
    const isAuthenticated = false; // 临时设置为 false

    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 保护管理员路由
  if (pathname.startsWith('/admin')) {
    // TODO: 检查用户认证状态和管理员权限
    const isAuthenticated = false; // 临时设置为 false
    const isAdmin = false; // 临时设置为 false

    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 如果已登录用户访问认证页面，重定向到仪表板
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    // TODO: 检查用户认证状态
    const isAuthenticated = false; // 临时设置为 false

    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
