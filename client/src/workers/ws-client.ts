import { Transaction } from "@/interfaces/transactions";
import { WsEventsEnum } from "@/enums/ws-events";
import config from "@/config";

interface WorkerMessage {
  type:
    | "CONNECT"
    | "DISCONNECTED"
    | "PAUSE"
    | "RESUME"
    | "NEW_TRANSACTION"
    | "ERROR";
}

class WebSocketWorker {
  private ws: WebSocket | null = null;
  private readonly wsUrl: string = config.webSocketUrl;
  private readonly maxTransactions: number = 500;
  private transactions: Transaction[] = [];
  private isStopped = false;

  constructor() {
    self.onmessage = this.handleMessage.bind(this);
  }

  private handleMessage = (event: MessageEvent<WorkerMessage>) => {
    const { type } = event.data;

    switch (type) {
      case WsEventsEnum.CONNECT:
        this.connect();
        break;
      case WsEventsEnum.DISCONNECTED:
        this.disconnect();

        break;
      case WsEventsEnum.PAUSE:
        this.isStopped = true;

        break;
      case WsEventsEnum.RESUME:
        this.isStopped = false;
        break;
    }
  };

  private handleWsMessage(event: MessageEvent): void {
    if (this.isStopped) {
      return;
    }

    const transaction = JSON.parse(event.data) as Transaction;
    this.transactions = [transaction, ...this.transactions].slice(
      0,
      this.maxTransactions
    );
    this.postMessage(WsEventsEnum.NEW_TRANSACTION, this.transactions);
  }

  private connect(): void {
    if (this.ws) return;

    this.ws = new WebSocket(this.wsUrl);
    this.ws.onmessage = this.handleWsMessage.bind(this);
    this.ws.onclose = () => this.postMessage(WsEventsEnum.DISCONNECTED);
    this.ws.onerror = () =>
      this.postMessage(
        WsEventsEnum.ERROR,
        new Error("WebSocket connection error")
      );
  }

  private disconnect(): void {
    if (!this.ws) return;

    this.ws.close();
    this.ws = null;
  }

  private postMessage(
    type: WorkerMessage["type"],
    payload?: Transaction[] | Error
  ): void {
    self.postMessage({ type, payload });
  }
}

new WebSocketWorker();
