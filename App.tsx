
import React, { useState } from "react";

// Pages
import WebDashboard from "./pages/WebDashboard";
import BillsSubscriptions from "./pages/BillsSubscriptions";
import Community from "./pages/Community";
import EducationCenter from "./pages/EducationCenter";
import EnhancedBudgetManagement from "./pages/EnhancedBudgetManagement";
import FinancialHealthScore from "./pages/FinancialHealthScore";
import FinancialLiteracyLibrary from "./pages/FinancialLiteracyLibrary";
import GoalsSaving from "./pages/GoalsSaving";
import InsuranceHub from "./pages/InsuranceHub";
import MarketPlace from "./pages/MarketPlace";
import PortfolioPage from "./pages/PortfolioPage";
import ProfileSettings from "./pages/ProfileSettings";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import SupportCenter from "./pages/SupportCenter";
import TaxManagement from "./pages/TaxManagement";
import TransactionLogging from "./pages/TransactionLogging";

// Components
import LandingPage from "./components/LandingPage";
import WebSidebar from "./components/WebSidebar";
import ButtonNavigation from "./components/ButtonNavigation";
import { ThemeProvider } from "./components/ThemeProvider";

// Context
import { BudgetProvider } from "./context/budget_context";
import { ThemeContextProvider } from "./context/ThemeContext";

// Styles
import "./styles/global.css";

export type Screen =
  | "landing"
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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "landing":
        return <LandingPage onNavigate={handleNavigate} />;
      case "dashboard":
        return <WebDashboard onNavigate={handleNavigate} />;
      case "bills":
        return <BillsSubscriptions />;
      case "community":
        return <Community />;
      case "education":
        return <EducationCenter />;
      case "enhanced-budget":
        return <EnhancedBudgetManagement />;
      case "health-score":
        return <FinancialHealthScore />;
      case "literacy":
        return <FinancialLiteracyLibrary />;
      case "goals":
        return <GoalsSaving />;
      case "insurance":
        return <InsuranceHub />;
      case "marketplace":
        return <MarketPlace />;
      case "portfolio":
        return <PortfolioPage />;
      case "profile":
        return <ProfileSettings />;
      case "reports":
        return <ReportsAnalytics />;
      case "support":
        return <SupportCenter />;
      case "tax":
        return <TaxManagement />;
      case "transactions":
        return <TransactionLogging />;
      default:
        return <div>Screen not found</div>;
    }
  };

  return (
    <ThemeContextProvider>
      <BudgetProvider>
        <ThemeProvider>
          <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
            {/* Sidebar */}
            <WebSidebar currentScreen={currentScreen} onNavigate={handleNavigate} />

            {/* Main Content */}
            <div style={{ flex: 1, padding: "1rem", overflow: "auto" }}>
              {/* Quick Buttons */}
              <ButtonNavigation currentScreen={currentScreen} onNavigate={handleNavigate} />
              {/* Active Page */}
              {renderScreen()}
            </div>
          </div>
        </ThemeProvider>
      </BudgetProvider>
    </ThemeContextProvider>
  );
}
