import { createBrowserRouter } from "react-router";
import React from "react";
const AlertsPage = React.lazy(() => import("@/modules/alerts/pages/index"));
const MonitorPage = React.lazy(() => import("@/modules/monitor/pages/index"));

const router = createBrowserRouter([
  {
    path: "/",
    Component: MonitorPage,
  },
  {
    path: "/alerts",
    Component: AlertsPage,
  },
]);

export default router;
