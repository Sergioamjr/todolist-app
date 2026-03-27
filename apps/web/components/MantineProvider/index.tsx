"use client";

import { MantineProvider as BaseMantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { theme } from "@/lib/theme";

export default function MantineProvider({ children }: { children: React.ReactNode }) {
  return <BaseMantineProvider theme={theme}>{children}</BaseMantineProvider>;
}
