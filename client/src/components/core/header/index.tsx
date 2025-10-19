import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/core/mode-toggle";
import { Link } from "react-router";
import { useWebSocket } from "@/contexts/ws.provider";

export const Header = () => {
  const { pause, resume } = useWebSocket();

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur px-4">
      <div className="flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">📈 Crypto Alerts</span>
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
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={pause}
            >
              Stop
            </Button>

            <Button
              variant="default"
              className="cursor-pointer"
              onClick={resume}
            >
              Start
            </Button>

            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};
