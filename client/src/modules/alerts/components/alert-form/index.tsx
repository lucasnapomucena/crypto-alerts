import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAlertsStore, type AlertCondition, type AlertSide } from "@/stores/use-alerts";
import { SUPPORTED_COINS } from "@/lib/coins";
import { cn } from "@/lib/utils";

const CONDITIONS: { value: AlertCondition; label: string }[] = [
  { value: "price_above", label: "Price above" },
  { value: "price_below", label: "Price below" },
  { value: "quantity_above", label: "Quantity above" },
  { value: "quantity_below", label: "Quantity below" },
];

const SIDES: { value: AlertSide; label: string }[] = [
  { value: "all", label: "Both" },
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
];

export const AlertForm = () => {
  const addRule = useAlertsStore((s) => s.addRule);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [symbol, setSymbol] = useState("BTC");
  const [condition, setCondition] = useState<AlertCondition>("price_above");
  const [side, setSide] = useState<AlertSide>("all");
  const [threshold, setThreshold] = useState("");

  const handleSubmit = () => {
    const value = parseFloat(threshold);
    if (!label.trim() || isNaN(value) || value <= 0) return;

    addRule({ label: label.trim(), symbol, condition, side, threshold: value, active: true });
    setLabel("");
    setThreshold("");
    setSymbol("BTC");
    setCondition("price_above");
    setSide("all");
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm">New Alert</Button>
      </SheetTrigger>

      <SheetContent className="p-6">
        <SheetHeader>
          <SheetTitle>Create Alert Rule</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 mt-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="e.g. BTC spike"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Coin</label>
            <div className="grid grid-cols-4 gap-2">
              {SUPPORTED_COINS.map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => setSymbol(coin.symbol)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-colors text-center",
                    symbol === coin.symbol
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {coin.symbol}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Condition</label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCondition(c.value)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-colors text-left",
                    condition === c.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Side</label>
            <div className="grid grid-cols-3 gap-2">
              {SIDES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSide(s.value)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-colors text-center",
                    side === s.value
                      ? s.value === "buy"
                        ? "border-green-500 bg-green-500/10 text-green-500"
                        : s.value === "sell"
                        ? "border-red-500 bg-red-500/10 text-red-500"
                        : "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Threshold{" "}
              <span className="text-muted-foreground font-normal">
                ({condition.startsWith("price") ? "USD" : "units"})
              </span>
            </label>
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 95000"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!label.trim() || !threshold}
            className="mt-2"
          >
            Create Alert
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
