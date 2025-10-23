
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        cardForeground: "var(--card-foreground)",
        popover: "var(--popover)",
        popoverForeground: "var(--popover-foreground)",
        primary: "var(--primary)",
        primaryForeground: "var(--primary-foreground)",
        secondary: "var(--secondary)",
        secondaryForeground: "var(--secondary-foreground)",
        muted: "var(--muted)",
        mutedForeground: "var(--muted-foreground)",
        accent: "var(--accent)",
        accentForeground: "var(--accent-foreground)",
        destructive: "var(--destructive)",
        destructiveForeground: "var(--destructive-foreground)",
        input: "var(--input)",
        inputBackground: "var(--input-background)",
        switchBackground: "var(--switch-background)",
        sidebar: "var(--sidebar)",
        sidebarForeground: "var(--sidebar-foreground)",
        sidebarPrimary: "var(--sidebar-primary)",
        sidebarPrimaryForeground: "var(--sidebar-primary-foreground)",
        sidebarAccent: "var(--sidebar-accent)",
        sidebarAccentForeground: "var(--sidebar-accent-foreground)",
        sidebarBorder: "var(--sidebar-border)",
        sidebarRing: "var(--sidebar-ring)",
        neonBlue: "var(--neon-blue)",
        neonBlueGlow: "var(--neon-blue-glow)",
        neonPink: "var(--neon-pink)",
        neonPinkGlow: "var(--neon-pink-glow)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        heading: ["Poppins", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(0, 0, 0, 0.05)",
        cardDark: "0 4px 20px rgba(0, 0, 0, 0.3)",
        neonBlue: "0 0 8px var(--neon-blue), 0 0 20px var(--neon-blue-glow)",
        neonPink: "0 0 8px var(--neon-pink), 0 0 20px var(--neon-pink-glow)",
      },
      backgroundImage: {
        "landing-gradient":
          "linear-gradient(135deg, var(--landing-bg-start), var(--landing-bg-middle), var(--landing-bg-end))",
        "card-gradient":
          "linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-middle), var(--bg-gradient-end))",
      },
      keyframes: {
        neonPulse: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.05)" },
        },
        neonShift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(5px, -5px)" },
        },
      },
      animation: {
        neonPulse: "neonPulse 3s ease-in-out infinite",
        neonShift: "neonShift 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
