
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import localforage from "localforage";
import { auth, db } from "../firebase/config";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";

// -------------------- Types --------------------
type ThemeMode = "light" | "dark";

interface ThemeColors {
  background: string;
  text: string;
}

interface ThemeContextProps {
  theme: ThemeColors;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

// -------------------- Themes --------------------
export const themes: Record<ThemeMode, ThemeColors> = {
  light: { background: "#ffffff", text: "#000000" },
  dark: { background: "#000000", text: "#ffffff" },
};

// -------------------- Context --------------------
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// -------------------- Provider --------------------
interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export const ThemeProvider = ({ children, defaultMode = "light" }: ThemeProviderProps) => {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);

  // Function to set mode and persist
  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    localforage.setItem("app-theme", newMode).catch(console.warn);

    const user = auth.currentUser;
    if (user) {
      const themeRef = doc(db, "users", user.uid);
      await setDoc(themeRef, { theme: newMode }, { merge: true }).catch(console.warn);
    }
  };

  // Toggle theme
  const toggleTheme = async () => setMode(mode === "light" ? "dark" : "light");

  // Load theme on mount
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadTheme = async () => {
      try {
        const user = auth.currentUser;
        let saved: ThemeMode | null = null;

        // Load from Firestore if logged in
        if (user) {
          const themeRef = doc(db, "users", user.uid);
          unsubscribe = onSnapshot(
            themeRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const remoteTheme = docSnap.data().theme as ThemeMode;
                if (remoteTheme === "light" || remoteTheme === "dark") setModeState(remoteTheme);
              }
            },
            (err) => console.error("Firestore listener error:", err)
          );

          const docSnap = await getDoc(themeRef);
          if (docSnap.exists()) saved = docSnap.data().theme as ThemeMode;
        }

        // Load from localforage if Firestore empty
        if (!saved) saved = (await localforage.getItem<ThemeMode>("app-theme")) || null;

        // Default to system preference if nothing found
        if (saved === "light" || saved === "dark") setModeState(saved);
        else setModeState(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      } catch (err) {
        console.warn("Theme load error:", err);
      }
    };

    loadTheme();

    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setModeState(e.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ theme: themes[mode], mode, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// -------------------- Hook --------------------
export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
