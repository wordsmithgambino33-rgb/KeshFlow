
import React, { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages / Components
import LandingPage from "./components/LandingPage";
import SignUpAuth from "./components/SignUpAuth";
import WebDashboard from "./pages/WebDashboard";
import BillsSubscriptions from "./pages/BillsSubscriptions";
import Community from "./pages/Community";
import EducationCenter from "./pages/EducationCenter";
import EnhancedBudgetManagement from "./pages/EnhancedBudgetManagement";
import FinancialHealthScore from "./pages/FinancialHealthScore";
import FinancialLiteracyLibrary from "./pages/FinancialLiteracyLibrary";
import GoalsSaving from "./pages/GoalSaving";
import InsuranceHub from "./pages/InsuranceHub";
import MarketPlace from "./pages/MarketPlace";
import PortfolioPage from "./pages/PortfolioPage";
import ProfileSettings from "./pages/ProfileSettings";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import SupportCenter from "./pages/SupportCenter";
import TaxManagement from "./pages/TaxManagement";
import TransactionLogging from "./pages/TransactionLogging";

// Components
import WebSidebar from "./components/WebSidebar";
import { BottomNavigation } from "./components/BottomNavigation";

// Context
import { BudgetProvider } from "./context/budget_context";

// Firebase Auth
import { auth } from "./firebase/config";

// -------------------- Theme Context --------------------
type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = "light" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Load saved theme or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("ndalaflow-theme") as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeState(systemPrefersDark ? "dark" : "light");
    }
  }, []);

  // Apply theme class to <html> and persist
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    localStorage.setItem("ndalaflow-theme", theme);
  }, [theme]);

  const toggleTheme = () => setThemeState((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

// -------------------- Screen Type --------------------
export type Screen =
  | "landing"
  | "auth"
  | "dashboard"
  | "bills"
  | "community"
  | "education"
  | "enhanced-budget"
  | "health-score"
  | "literacy"
  | "goals"
  | "insurance"
  | "marketplace"
  | "portfolio"
  | "profile"
  | "reports"
  | "support"
  | "tax"
  | "transactions";

// -------------------- App Component --------------------
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-landing-gradient text-foreground font-sans">
        Loading...
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BudgetProvider>
        <Router>
          {/* Main wrapper with theme-aware classes */}
          <div className="flex min-h-screen font-sans transition-colors duration-500 bg-background text-foreground">
            
            {/* Sidebar (only when logged in) */}
            {user && (
              <WebSidebar
                currentScreen={currentScreen}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            )}

            {/* Main Content */}
            <div className="flex-1 p-4 lg:p-6 overflow-auto">
              <Routes>
                {/* Landing and Auth */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<SignUpAuth />} />

                {/* Protected Dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    user ? (
                      <WebDashboard onNavigate={(screen) => setCurrentScreen(screen)} />
                    ) : (
                      <Navigate to="/auth" replace />
                    )
                  }
                />

                {/* Other Protected Pages */}
                <Route
                  path="/bills"
                  element={user ? <BillsSubscriptions /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/community"
                  element={user ? <Community /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/education"
                  element={user ? <EducationCenter /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/enhanced-budget"
                  element={user ? <EnhancedBudgetManagement /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/health-score"
                  element={user ? <FinancialHealthScore /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/literacy"
                  element={user ? <FinancialLiteracyLibrary /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/goals"
                  element={
                    user ? <GoalsSaving onBack={() => setCurrentScreen("dashboard")} /> : <Navigate to="/auth" replace />
                  }
                />
                <Route
                  path="/insurance"
                  element={
                    user ? <InsuranceHub onNavigate={(screen) => setCurrentScreen(screen)} /> : <Navigate to="/auth" replace />
                  }
                />
                <Route
                  path="/marketplace"
                  element={user ? <MarketPlace /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/portfolio"
                  element={user ? <PortfolioPage /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/profile"
                  element={user ? <ProfileSettings /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/reports"
                  element={user ? <ReportsAnalytics /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/support"
                  element={user ? <SupportCenter /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/tax"
                  element={user ? <TaxManagement /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/transactions"
                  element={user ? <TransactionLogging /> : <Navigate to="/auth" replace />}
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              {/* Bottom Navigation (only when logged in) */}
              {user && (
                <BottomNavigation
                  currentScreen={currentScreen}
                  onNavigate={(screen) => setCurrentScreen(screen)}
                />
              )}
            </div>
          </div>
        </Router>
      </BudgetProvider>
    </ThemeProvider>
  );
}
