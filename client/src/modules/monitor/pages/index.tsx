import { useState } from "react";
import { TransactionsList } from "@/modules/monitor/components/transactions";
import { Layout } from "@/components/core/layout";
import { SUPPORTED_COINS } from "@/lib/coins";
import { cn } from "@/lib/utils";

const SIDES = [
  { label: "All", value: undefined },
  { label: "Buy", value: 1 },
  { label: "Sell", value: 2 },
] as const;

export default function MonitorPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  const [selectedSide, setSelectedSide] = useState<number | undefined>(undefined);

  return (
    <Layout>
      <section className="w-full flex items-center justify-between mb-6">
        <h1 className="text-2xl">Monitor transactions</h1>
        <div className="flex gap-2">
          {SUPPORTED_COINS.map((coin) => (
            <button
              key={coin.symbol}
              onClick={() => setSelectedSymbol(coin.symbol)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm transition-colors",
                selectedSymbol === coin.symbol
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted"
              )}
            >
              {coin.symbol}
            </button>
          ))}
        </div>
      </section>

      <div className="flex gap-1 mb-4 border-b">
        {SIDES.map((side) => (
          <button
            key={String(side.value)}
            onClick={() => setSelectedSide(side.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              selectedSide === side.value
                ? side.value === 1
                  ? "border-green-500 text-green-500"
                  : side.value === 2
                  ? "border-red-500 text-red-500"
                  : "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {side.label}
          </button>
        ))}
      </div>

      <section className="max-w-full">
        <TransactionsList symbol={selectedSymbol} side={selectedSide} />
      </section>
    </Layout>
  );
}
