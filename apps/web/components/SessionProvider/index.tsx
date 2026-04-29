"use client";

import { createContext, useContext } from "react";
import type { ServerSession } from "@/lib/session.server";

const SessionContext = createContext<ServerSession>(null);

export function SessionProvider({
  initialSession,
  children,
}: {
  initialSession: ServerSession;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={initialSession}>
      {children}
    </SessionContext.Provider>
  );
}

export function useServerSession() {
  return useContext(SessionContext);
}
