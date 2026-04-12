"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axiosInstance, client } from "@kubb/plugin-client/clients/axios";

client.setConfig({ baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001" });
axiosInstance.defaults.withCredentials = true;

const queryClient = new QueryClient();

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
