import { Transaction } from "@/interfaces/transactions";
import { WsEventsEnum } from "@/enums/ws-events";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useWebSocketWorker() {
  const UPDATE_INTERVAL = 2000;
  const workerRef = useRef<Worker | null>(null);
  const transactionsRef = useRef<Transaction[]>([]);
  const lastUpdateTime = useRef<number>(Date.now());
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const pause = () => {
    workerRef.current?.postMessage({ type: WsEventsEnum.PAUSE });
    toast.error("Paused");
  };

  const resume = () => {
    workerRef.current?.postMessage({ type: WsEventsEnum.RESUME });
    toast.success("Start");
  };

  useEffect(() => {
    if (workerRef.current) return;

    workerRef.current = new Worker(
      new URL("@/workers/ws-client", import.meta.url),
      { type: "module" }
    );

    workerRef.current.onmessage = (event: MessageEvent) => {
      const { type, payload } = event.data;

      if (type === WsEventsEnum.NEW_TRANSACTION) {
        const now = Date.now();

        transactionsRef.current = payload;

        if (now - lastUpdateTime.current >= UPDATE_INTERVAL) {
          setTransactions(transactionsRef.current);
          lastUpdateTime.current = now;
        }
      }
    };

    workerRef.current?.postMessage({ type: WsEventsEnum.CONNECT });

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return {
    pause,
    resume,
    transactions,
  };
}
