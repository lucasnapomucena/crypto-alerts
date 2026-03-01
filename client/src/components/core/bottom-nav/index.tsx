import { Activity, Bell } from "lucide-react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="flex h-14">
        <Link
          to="/"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
            pathname === "/" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <Activity className="h-5 w-5" />
          Monitor
        </Link>
        <Link
          to="/alerts"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
            pathname === "/alerts" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <Bell className="h-5 w-5" />
          Alerts
        </Link>
      </div>
    </nav>
  );
};
