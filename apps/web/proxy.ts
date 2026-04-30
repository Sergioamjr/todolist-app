import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/", "/login", "/dashboard"],
};

export function proxy(request: NextRequest) {
  const token =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  const isLoginPage = request.nextUrl.pathname === "/login";
  console.log("token", { token, isLoginPage });

  if (!token && !isLoginPage) {
    console.log("sending to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isLoginPage) {
    console.log("sending to home");
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
