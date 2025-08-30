// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  // Protect everything except next internals, static, auth API, images, public, favicon
  matcher: ["/((?!_next/static|_next/image|api/auth|public|favicon.ico).*)"],
};

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/static")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;

  // Pages that should be open to non-authenticated users
  const publicPages = ["/login", "/signup"];
  const isPublicPage = publicPages.includes(pathname);

  // Logged-in users should not access /login or /signup
  if (isLoggedIn && isPublicPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Not logged in users trying to access protected pages -> redirect to login
  if (!isLoggedIn && !isPublicPage) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }


  return NextResponse.next();
}
