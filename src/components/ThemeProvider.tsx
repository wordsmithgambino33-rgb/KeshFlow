

import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import localforage from "localforage"; // <--- use this instead of AsyncStorage
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

type ThemeMode = "light" | "dark";

const themes = {
  light: { background: "#fff", text: "#000" },
  dark: { background: "#000", text: "#fff" },
};

interface ThemeContextProps {
  theme: typeof themes.light | typeof themes.dark;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>("light");

  const setMode = async (newMode: ThemeMode) => {
    try {
      setModeState(newMode);
      await localforage.setItem("app-theme", newMode); // <--- store in browser
      const user = auth.currentUser;
      if (user) {
        const themeRef = doc(db, "users", user.uid);
        await setDoc(themeRef, { theme: newMode }, { merge: true });
      }
    } catch (err) {
      console.warn("Failed to save theme:", err);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadTheme = async () => {
      try {
        const user = auth.currentUser;
        let saved: string | null = null;

        if (user) {
          const themeRef = doc(db, "users", user.uid);
          unsubscribe = onSnapshot(
            themeRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const remoteTheme = docSnap.data().theme;
                if (remoteTheme === "light" || remoteTheme === "dark") setModeState(remoteTheme);
              }
            },
            (err) => console.error("Firestore listener error:", err)
          );

          const docSnap = await getDoc(themeRef);
          if (docSnap.exists()) saved = docSnap.data().theme;
        }

        if (!saved) saved = await localforage.getItem<string>("app-theme"); // <--- async fetch from browser

        if (saved === "light" || saved === "dark") setModeState(saved);
        else setModeState(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      } catch (err) {
        console.warn("Theme load error:", err);
      }
    };

    loadTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setModeState(mediaQuery.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const toggleTheme = () => setMode(mode === "light" ? "dark" : "light");
  const theme = mode === "light" ? themes.light : themes.dark;

  return <ThemeContext.Provider value={{ theme, mode, setMode, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};


export default themes;
