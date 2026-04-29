import Header, { HeaderProps } from "../Header";
import { PropsWithChildren } from "react";

type AppLayoutProps = PropsWithChildren<HeaderProps>;

export default function AppLayout({ children, withoutLogout }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {!withoutLogout && <Header withoutLogout={withoutLogout} />}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
