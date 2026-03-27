import { createTheme, rem } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "violet",
  defaultRadius: "md",
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontFamilyMonospace: "var(--font-geist-mono), monospace",
  colors: {
    violet: [
      "#f3f0ff",
      "#e5dbff",
      "#d0bfff",
      "#b197fc",
      "#9775fa",
      "#845ef7",
      "#7950f2",
      "#7048e8",
      "#6741d9",
      "#5f3dc4",
    ],
  },
  headings: {
    fontFamily: "var(--font-geist-sans), sans-serif",
    fontWeight: "700",
    sizes: {
      h1: { fontSize: rem(32) },
      h2: { fontSize: rem(24) },
      h3: { fontSize: rem(20) },
    },
  },
  defaultGradient: {
    from: "violet",
    to: "grape",
    deg: 135,
  },
});
