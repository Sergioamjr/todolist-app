import Header from "../Header";

export default function AppLayout({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Header userName={userName} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
