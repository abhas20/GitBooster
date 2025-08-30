import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const config = {
  // Runs on all paths except for the ones specified
  matcher: ["/((?!_next/static|_next/image|public/|favicon.ico).*)"],
};

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        if (
          pathname.startsWith("/api/auth") ||
          pathname === "/login" ||
          pathname === "/signup"
        ) {
          return true;
        }
        // return token? true : false
        return !!token;
      },
    },
  }
);
