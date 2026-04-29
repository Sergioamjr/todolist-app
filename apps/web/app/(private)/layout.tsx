import { getServerSession } from "@/lib/session.server";
import { SessionProvider } from "@/components/SessionProvider";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  return <SessionProvider initialSession={session}>{children}</SessionProvider>;
}
