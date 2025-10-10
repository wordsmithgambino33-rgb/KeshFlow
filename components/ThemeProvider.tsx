
// components/ThemeProvider.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { app } from "../firebase/config"; 

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
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Persist mode locally & in Firebase
  const setMode = async (newMode: ThemeMode) => {
    try {
      setModeState(newMode);
      await AsyncStorage.setItem("app-theme", newMode);

      // Save to Firebase if logged in
      const user = auth.currentUser;
      if (user) {
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

        if (user) {
          const themeRef = doc(db, "users", user.uid);

          // Listen to real-time updates
          unsubscribe = onSnapshot(themeRef, (docSnap) => {
            if (docSnap.exists()) {
              const remoteTheme = docSnap.data().theme;
              if (remoteTheme === "light" || remoteTheme === "dark") {
                setModeState(remoteTheme);
              }
            }
          });

          // Try to get initial theme from Firebase
          const docSnap = await themeRef.get();
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

    // Cleanup
    return () => {
      sub.remove();
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
