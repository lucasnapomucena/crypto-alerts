import { createContext, ReactNode, useContext, useEffect, useRef } from "react";
import appConfig from "@/config";
import { Transaction } from "@/interfaces/transactions";
import { toast } from "sonner";
import { useTransactionsStore } from "@/stores/use-transactions";

export enum WsEventsEnum {
  CONNECT = "CONNECT",
  DISCONNECTED = "DISCONNECTED",
  NEW_MESSAGE = "NEW_MESSAGE",
  PAUSE = "PAUSE",
  RESUME = "RESUME",
  ERROR = "ERROR",
}

type WebSocketContextProps = {
  pause: () => void;
  resume: () => void;
};

const WebSocketContext = createContext<WebSocketContextProps>(
  {} as WebSocketContextProps
);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const UPDATE_INTERVAL = 2000;
  const workerRef = useRef<Worker | null>(null);
  const transactionsRef = useRef<Transaction[]>([]);
  const lastUpdateTime = useRef<number>(Date.now());
  const addTransaction = useTransactionsStore().addTransaction;

  const config = {
    wsUrl: appConfig.webSocketUrl,
    maxItems: 250,
  };

  const pause = () => {
    workerRef.current?.postMessage({ type: WsEventsEnum.PAUSE });
    toast.error("Paused");
  };

  const resume = () => {
    workerRef.current?.postMessage({ type: WsEventsEnum.RESUME });
    toast.success("Resumed");
  };

  useEffect(() => {
    if (workerRef.current) return;

    workerRef.current = new Worker(
      new URL("@/workers/websocket/ws-client", import.meta.url),
      { type: "module" }
    );

    workerRef.current.onmessage = (event: MessageEvent) => {
      const { type, payload } = event.data;

      if (type === WsEventsEnum.NEW_MESSAGE) {
        const now = Date.now();

        transactionsRef.current = payload;

        if (now - lastUpdateTime.current >= UPDATE_INTERVAL) {
          addTransaction(transactionsRef.current);
          lastUpdateTime.current = now;
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
    <WebSocketContext.Provider value={{ pause, resume }}>
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
