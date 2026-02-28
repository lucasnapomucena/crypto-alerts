import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/core/mode-toggle";
import { Link } from "react-router";
import { useWebSocket, type ConnectionStatus } from "@/contexts/ws.provider";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { label: string; color: string }
> = {
  connecting: { label: "Connecting", color: "bg-yellow-400" },
  connected: { label: "Connected", color: "bg-green-500" },
  disconnected: { label: "Disconnected", color: "bg-red-500" },
  paused: { label: "Paused", color: "bg-orange-400" },
};

export const Header = () => {
  const { pause, resume, status } = useWebSocket();
  const { label, color } = STATUS_CONFIG[status];

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur px-4">
      <div className="flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Crypto Alerts</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/" className="transition-colors hover:text-foreground/80">
              Monitor
            </Link>
            <Link
              to="/alerts"
              className="transition-colors hover:text-foreground/80"
            >
              Alerts
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={cn("h-2 w-2 rounded-full animate-pulse", color)} />
            {label}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={status === "paused" ? resume : pause}
          >
            {status === "paused" ? "Resume" : "Pause"}
          </Button>

          <ModeToggle />
        </div>
      </div>
    </header>
  );
};
