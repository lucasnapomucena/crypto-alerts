import React, { StrictMode, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";

import { ThemeProvider } from "@/components/theme-provider";
import { WebSocketProvider } from "./contexts/ws.provider";

const AlertsPage = React.lazy(() => import("@/modules/alerts/pages/index"));
const MonitorPage = React.lazy(() => import("@/modules/monitor/pages/index"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <WebSocketProvider>
          <Suspense fallback={<>Loading...</>}>
            <Routes>
              <Route path="/" element={<MonitorPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
            </Routes>
          </Suspense>
        </WebSocketProvider>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  </StrictMode>
);
