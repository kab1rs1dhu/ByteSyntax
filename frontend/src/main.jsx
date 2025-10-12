import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import {
  Routes,
  Route,
  BrowserRouter,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router";
import { Toaster } from "react-hot-toast";

import * as Sentry from "@sentry/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "./providers/AuthProvider.jsx";

const queryClient = new QueryClient();

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.reactRouterV7BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  tracesSampleRate: 1.0,
});

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#2563eb",              // indigo-500
    colorText: "white",
    colorBackground: "rgba(0,0,0,0.70)",  // glassy dark background
    colorInputBackground: "rgba(255,255,255,0.06)",
    colorAlphaShade: "rgba(255,255,255,0.08)",
    borderRadius: "14px",                 // matches .cta-button
    fontFamily: '"Inter", system-ui, sans-serif',
  },
  elements: {
    modal: { zIndex: 10020 },
    card: {
      background: "rgba(0,0,0,50)",
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow:
        "0 25px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
      backdropFilter: "blur(10px)",
    },
    headerTitle: {
      color: "white",
      background: "linear-gradient(135deg,#ffffff,#f1f5f9,#e2e8f0)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    headerSubtitle: { color: "#cbd5e1" },
    formFieldInput: {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.15)",
      color: "white",
    },
    formButtonPrimary: {
      background: "linear-gradient(135deg,#1a1a1a,#1e3a8a,#2563eb,#000000)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow:
        "0 8px 25px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
      textTransform: "uppercase",
      letterSpacing: "0.025em",
    },
    formButtonPrimary__hover: {
      background: "linear-gradient(135deg,#2a2a2a,#3a3a3a,#4a4a4a)",
    },
    socialButtonsBlockButton: {
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "white",
    },
    footer: { color: "#ffffffff" },
    
  },
};


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={clerkAppearance}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
          <Toaster position="top-right" />
        </QueryClientProvider>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);