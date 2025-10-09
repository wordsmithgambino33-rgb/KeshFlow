
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themes } from "../styles/theme";

type ThemeMode = "light" | "dark";

interface ThemeContextProps {
  theme: typeof themes.light | typeof themes.dark;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>("light");

  // Persist mode changes
  const setMode = async (newMode: ThemeMode) => {
    try {
      setModeState(newMode);
      await AsyncStorage.setItem("app-theme", newMode);
    } catch (err) {
      console.warn("Failed to save theme:", err);
    }
  };

  // Auto-detect system theme on first load if none saved
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem("app-theme");
        if (saved === "light" || saved === "dark") {
          setModeState(saved);
        } else {
          const systemTheme = Appearance.getColorScheme() as ThemeMode;
          setModeState(systemTheme || "light");
        }
      } catch (err) {
        console.warn("Theme load error:", err);
      }
    };
    loadTheme();

    // Listen for system theme changes dynamically
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (!colorScheme) return;
      setModeState(colorScheme as ThemeMode);
    });

    return () => sub.remove();
  }, []);

  // Function to toggle between light/dark mode
  const toggleTheme = () => setMode(mode === "light" ? "dark" : "light");

  const theme = mode === "light" ? themes.light : themes.dark;

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for safe context access
export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
