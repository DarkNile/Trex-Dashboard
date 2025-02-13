import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside

const publicRoutes = ["/login", "resetpassword", "requestresetpassword"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPulicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  const token = request.cookies.get("token")?.value;

  console.log("token", token);

  if (isPulicRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isPulicRoute && !token) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set("redirectTo", path);
    return response;
  }
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
