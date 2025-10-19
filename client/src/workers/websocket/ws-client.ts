type MessageType =
  | "CONNECT"
  | "DISCONNECTED"
  | "PAUSE"
  | "RESUME"
  | "NEW_MESSAGE"
  | "ERROR";

interface WebSocketWorkerConfig {
  wsUrl: string;
  maxItems?: number;
}

class WebSocketClient<T> {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private maxItems: number;
  private messages: T[] = [];
  private isStopped = false;

  constructor(config: WebSocketWorkerConfig) {
    this.wsUrl = config.wsUrl;
    this.maxItems = config.maxItems ?? 500;

    self.onmessage = this.handleMessage.bind(this);
  }

  private handleMessage(
    event: MessageEvent<{
      type: MessageType;
      config: { wsUrl: string; maxItems: number };
    }>
  ) {
    const { type, config } = event.data;

    switch (type) {
      case "CONNECT":
        if (config) {
          this.wsUrl = config.wsUrl;
          this.maxItems = config.maxItems ?? 500;
          this.connect();
        }
        break;
      case "DISCONNECTED":
        this.disconnect();
        break;
      case "PAUSE":
        this.isStopped = true;
        break;
      case "RESUME":
        this.isStopped = false;
        break;
    }
  }

  private handleWsMessage(event: MessageEvent) {
    if (this.isStopped) return;

    try {
      const parsed = JSON.parse(event.data);
      this.messages = [parsed, ...this.messages].slice(0, this.maxItems);

      this.postMessage("NEW_MESSAGE", this.messages);
    } catch (err) {
      this.postMessage(
        "ERROR",
        err instanceof Error ? err : new Error("Parse error")
      );
    }
  }

  private connect() {
    if (this.ws) return;

    this.ws = new WebSocket(this.wsUrl);
    this.ws.onmessage = this.handleWsMessage.bind(this);
    this.ws.onclose = () => this.postMessage("DISCONNECTED");
    this.ws.onerror = () =>
      this.postMessage("ERROR", new Error("WebSocket error"));
  }

  private disconnect(): void {
    if (!this.ws) return;

    this.ws.close();
    this.ws = null;
  }

  private postMessage(type: MessageType, payload?: T[] | Error) {
    self.postMessage({ type, payload });
  }
}

new WebSocketClient({ wsUrl: "", maxItems: 500 });
