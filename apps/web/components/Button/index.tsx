"use client";

import { Button as MantineButton } from "@mantine/core";

export default function Button({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return <MantineButton onClick={onClick}>{children}</MantineButton>;
}
