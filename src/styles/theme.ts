

// styles/theme.ts

export const themes = {
  light: {
    name: "light",
    background: "#ffffff",
    foreground: "#0f172a", // slate-900
    card: "#ffffff",
    cardForeground: "#0f172a",
    primary: "#2563eb", // blue-600
    primaryForeground: "#f8fafc",
    secondary: "#f1f5f9",
    secondaryForeground: "#0f172a",
    border: "#e2e8f0",
    muted: "#f8fafc",
    mutedForeground: "#475569",
    accent: "#e0f2fe",
    accentForeground: "#075985",
  },
  dark: {
    name: "dark",
    background: "#0f172a", // slate-900
    foreground: "#f8fafc",
    card: "#1e293b",
    cardForeground: "#f8fafc",
    primary: "#3b82f6",
    primaryForeground: "#0f172a",
    secondary: "#334155",
    secondaryForeground: "#f8fafc",
    border: "#475569",
    muted: "#1e293b",
    mutedForeground: "#94a3b8",
    accent: "#1e3a8a",
    accentForeground: "#e0f2fe",
  },
};

// Optional helper type (for TypeScript intellisense)
export type ThemeMode = keyof typeof themes;
