
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { ThemeProvider } from "../src/components/ThemeProvider";
import { AnimatePresence } from "framer-motion";

// Optional: clear console noise during hot reload
console.clear();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AnimatePresence mode="wait">
        <App />
      </AnimatePresence>
    </ThemeProvider>
  </React.StrictMode>
);
