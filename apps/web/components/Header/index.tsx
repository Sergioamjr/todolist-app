"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { removeCookieAction } from "@/actions";
import DateHelper from "@/helpers/date";

export default function Header({ userName = "Guest" }: { userName?: string }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  console.log("session", session);

  async function handleSignOut() {
    removeCookieAction("better-auth.session_token");
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <span className="font-semibold">{session?.user.name ?? userName}</span>
        <span className="text-primary-light text-sm">
          {DateHelper.formatDate(new Date(), "MMMM D, YYYY")}
        </span>
        {session && (
          <button
            onClick={handleSignOut}
            className="text-sm cursor-pointer text-white/70 hover:text-white transition-colors"
          >
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
