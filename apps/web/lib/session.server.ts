import { cookies } from "next/headers";

export type ServerSession = {
  user: { id: string; name: string; email: string };
  session: { id: string; expiresAt: string };
} | null;

export async function getServerSession(): Promise<ServerSession> {
  const cookieStore = await cookies();
  const res = await fetch(
    `${process.env.API_URL ?? "http://localhost:3001"}/api/auth/get-session`,
    { headers: { cookie: cookieStore.toString() }, cache: "no-store" },
  );
  if (!res.ok) return null;
  return res.json();
}
