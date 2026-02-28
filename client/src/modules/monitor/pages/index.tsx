import { useState } from "react";
import { TransactionsList } from "@/modules/monitor/components/transactions";
import { Layout } from "@/components/core/layout";
import { SUPPORTED_COINS } from "@/lib/coins";
import { cn } from "@/lib/utils";

export default function MonitorPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");

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

      <section className="max-w-full">
        <TransactionsList symbol={selectedSymbol} />
      </section>
    </Layout>
  );
}
