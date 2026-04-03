"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const formattedDate = new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
});

export default function Header({ userName = "Guest" }: { userName?: string }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <span className="font-semibold">
          {session?.user.name ?? userName}
        </span>
        <span className="text-primary-light text-sm">{formattedDate}</span>
        {session && (
          <button
            onClick={handleSignOut}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
