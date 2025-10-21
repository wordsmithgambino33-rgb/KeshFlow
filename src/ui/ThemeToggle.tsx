
"use client";

import * as React from "react";
import { useTheme } from "next-themes";

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

export { ThemeToggle };

export default ThemeToggle;

export { ThemeToggle };
