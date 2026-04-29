"use server";
import { cookies } from "next/headers";

export async function removeCookieAction(name: string) {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}
