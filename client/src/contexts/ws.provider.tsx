import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import appConfig from "@/config";
import { Transaction } from "@/interfaces/transactions";
import { useTransactionsStore } from "@/stores/use-transactions";
import { useAlertsStore } from "@/stores/use-alerts";
import { formatPrice, formatQuantity } from "@/lib/transaction-formatters";

export enum WsEventsEnum {
  CONNECT = "CONNECT",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  NEW_MESSAGE = "NEW_MESSAGE",
  PAUSE = "PAUSE",
  RESUME = "RESUME",
  ERROR = "ERROR",
}

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "paused";

type WebSocketContextProps = {
  status: ConnectionStatus;
  pause: () => void;
  resume: () => void;
};

const WebSocketContext = createContext<WebSocketContextProps>(
  {} as WebSocketContextProps
);

interface WebSocketProviderProps {
  children: ReactNode;
}

function evaluateAlerts(transaction: Transaction) {
  const { rules, addTriggered } = useAlertsStore.getState();
  const activeRules = rules.filter((r) => {
    if (!r.active || r.symbol !== transaction.FSYM) return false;
    if (r.side === "buy" && transaction.SIDE !== 1) return false;
    if (r.side === "sell" && transaction.SIDE !== 2) return false;
    return true;
  });

  for (const rule of activeRules) {
    const value =
      rule.condition === "price_above" || rule.condition === "price_below"
        ? transaction.P
        : transaction.Q;

    const triggered =
      rule.condition === "price_above" || rule.condition === "quantity_above"
        ? value > rule.threshold
        : value < rule.threshold;

    if (triggered) {
      addTriggered({
        ruleId: rule.id,
        ruleLabel: rule.label,
        condition: rule.condition,
        threshold: rule.threshold,
        transaction,
        triggeredAt: Date.now(),
      });

      const valueStr =
        rule.condition === "price_above" || rule.condition === "price_below"
          ? formatPrice(value)
          : formatQuantity(value);

      toast.warning(`Alert: ${rule.label}`, {
        description: `${transaction.FSYM}/${transaction.TSYM} — ${valueStr}`,
      });
    }
  }
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const UPDATE_INTERVAL = 2000;
  const workerRef = useRef<Worker | null>(null);
  const transactionsRef = useRef<Transaction[]>([]);
  const lastUpdateTime = useRef<number>(Date.now());
  const lastEvaluatedCCSeq = useRef<number>(-1);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  const config = {
    wsUrl: appConfig.webSocketUrl,
    maxItems: 250,
  };

  const pause = () => {
    workerRef.current?.postMessage({ type: WsEventsEnum.PAUSE });
    setStatus("paused");
  };

  const resume = () => {
    workerRef.current?.postMessage({ type: WsEventsEnum.RESUME });
    setStatus("connected");
  };

  useEffect(() => {
    if (workerRef.current) return;

    workerRef.current = new Worker(
      new URL("@/workers/websocket/ws-client", import.meta.url),
      { type: "module" }
    );

    workerRef.current.onmessage = (event: MessageEvent) => {
      const { type, payload } = event.data;

      switch (type) {
        case WsEventsEnum.CONNECTED:
          setStatus("connected");
          break;

        case WsEventsEnum.DISCONNECTED:
          setStatus((prev) => (prev === "paused" ? "paused" : "disconnected"));
          break;

        case WsEventsEnum.NEW_MESSAGE: {
          const now = Date.now();
          transactionsRef.current = payload;

          // Evaluate alerts only for the newest transaction
          const latest: Transaction = payload[0];
          if (latest && latest.CCSEQ !== lastEvaluatedCCSeq.current) {
            lastEvaluatedCCSeq.current = latest.CCSEQ;
            evaluateAlerts(latest);
          }

          if (now - lastUpdateTime.current >= UPDATE_INTERVAL) {
            useTransactionsStore.getState().addTransaction(transactionsRef.current);
            lastUpdateTime.current = now;
          }
          break;
        }
      }
    };

    workerRef.current?.postMessage({
      type: WsEventsEnum.CONNECT,
      config: config,
    });

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ status, pause, resume }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = (): WebSocketContextProps => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
