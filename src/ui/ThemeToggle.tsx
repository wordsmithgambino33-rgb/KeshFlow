"use client";

import * as React from "react";

import { Switch } from "../ui/switch"; // Adjust path based on your folder structure (e.g., "@/components/ui/switch")
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"; // Optional: Wrap with Tooltip for UX

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Switch
          checked={theme === "dark"}
          onCheckedChange={(checked: boolean) => {
            setTheme(checked ? "dark" : "light");
          }}
          aria-label="Toggle dark mode"
        />
      </TooltipTrigger>
      <TooltipContent>Toggle theme</TooltipContent>
    </Tooltip>
  );
}

export default ThemeToggle;

const useTheme = () => {
  // next-themes isn't installed in this Vite app — provide a minimal fallback.
  return { theme: "light", setTheme: (_: string) => {} };
};
