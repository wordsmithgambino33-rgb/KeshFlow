
// components/ThemeProvider.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config"; // use exported instances

type ThemeMode = "light" | "dark";

// Define basic theme objects to prevent 'themes is not defined' error
const themes = {
  light: {
    background: "#fff",
    text: "#000",
  },
  dark: {
    background: "#000",
    text: "#fff",
  },
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

  // Persist mode locally & in Firebase
  const setMode = async (newMode: ThemeMode) => {
    try {
      setModeState(newMode);
      await AsyncStorage.setItem("app-theme", newMode);

      const user = auth.currentUser;
      if (user && user.uid) {
        const themeRef = doc(db, "users", user.uid);
        await setDoc(themeRef, { theme: newMode }, { merge: true });
      }
    } catch (err) {
      console.warn("Failed to save theme:", err);
    }
  };

  // Load initial theme and listen for Firebase real-time changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadTheme = async () => {
      try {
        const user = auth.currentUser;
        let saved: string | null = null;

        if (user && user.uid) {
          const themeRef = doc(db, "users", user.uid);

          // Listen to real-time updates safely
          unsubscribe = onSnapshot(
            themeRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const remoteTheme = docSnap.data().theme;
                if (remoteTheme === "light" || remoteTheme === "dark") {
                  setModeState(remoteTheme);
                }
              }
            },
            (error) => {
              console.error("Firestore listener error:", error);
            }
          );

          // Try to get initial theme from Firestore
          const docSnap = await getDoc(themeRef);
          if (docSnap.exists()) {
            saved = docSnap.data().theme;
          }
        }

        // Fallback to AsyncStorage
        if (!saved) {
          saved = await AsyncStorage.getItem("app-theme");
        }

        if (saved === "light" || saved === "dark") {
          setModeState(saved);
        } else {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          setModeState(prefersDark ? "dark" : "light");
        }
      } catch (err) {
        console.warn("Theme load error:", err);
      }
    };

    loadTheme();

    // Listen for system theme changes dynamically
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setModeState(mediaQuery.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Toggle theme
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