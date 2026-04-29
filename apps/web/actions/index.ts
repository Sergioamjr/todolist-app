"use server";
import { cookies } from "next/headers";

export async function removeCookieAction(name: string) {
  console.log("deleting cookie", name);
  const cookieStore = await cookies();
  cookieStore.delete(name);
}
