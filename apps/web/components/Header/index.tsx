"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { removeCookieAction } from "@/actions";
import { useServerSession } from "@/components/SessionProvider";

export type HeaderProps = {
  withoutLogout?: boolean;
};

export default function Header({ withoutLogout }: HeaderProps) {
  const router = useRouter();
  const session = useServerSession();

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          console.log("onsuccess");
          await removeCookieAction("better-auth.session_token");
          console.log("cookie removed 1");
          await removeCookieAction("__Secure-better-auth.session_token");
          console.log("cookie removed 2, redirecting to login...");
          router.push("/login");
        },
        onError: (ctx) => {
          console.error("Error signing out:", ctx.error);
        },
      },
    });
  }

  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {!withoutLogout && (
          <>
            <span className="font-semibold">Olá, {session?.user.name}</span>
            <button
              onClick={handleSignOut}
              className="text-sm cursor-pointer text-white/70 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
