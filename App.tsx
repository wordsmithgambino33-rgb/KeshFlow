
// App.tsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";
import { LandingPage } from "./components/LandingPage";
import { WebDashboard } from "./pages/WebDashboard";

// App content wrapped in theme logic
function AppContent() {
  const { mode } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // Simulate initial load
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          backgroundColor: mode === "dark" ? "#0a0a0a" : "#ffffff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            border: `4px solid ${mode === "dark" ? "#26a69a" : "#00796B"}`,
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            borderTopColor: "transparent",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<WebDashboard />} />
        <Route path="*" element={<Navigate to="/" />} /> {/* fallback */}
      </Routes>
    </Router>
  );
}

// Root component
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
