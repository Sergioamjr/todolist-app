import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

// export const config = {
//   matcher: ["/", "/login", "/dashboard"],
// };

export async function proxy(request: NextRequest) {
  // __Secure-better-auth.session_token
  // const cookieStore = await cookies();
  // const token = cookieStore.get("better-auth.session_token");
  // const isLoginPage = request.nextUrl.pathname === "/login";
  // console.log("proxy", {
  //   token,
  //   isLoginPage,
  // });

  // if (!token && !isLoginPage) {
  //   console.log("sending to login");
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  // if (token && isLoginPage) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  return NextResponse.next();
}
