"use server";
import { cookies } from "next/headers";

export async function removeCookieAction(name: string) {
  const cookieStore = await cookies();
  cookieStore.set(name, "", {
    maxAge: 0,
    path: "/",
    secure: name.startsWith("__Secure-"),
    httpOnly: true,
    sameSite: "lax",
  });
}
