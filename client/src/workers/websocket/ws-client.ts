type MessageType =
  | "CONNECT"
  | "CONNECTED"
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
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private intentionalDisconnect = false;

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
          this.intentionalDisconnect = false;
          this.connect();
        }
        break;
      case "DISCONNECTED":
        this.intentionalDisconnect = true;
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
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.ws = new WebSocket(this.wsUrl);
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.postMessage("CONNECTED");
    };

    this.ws.onmessage = this.handleWsMessage.bind(this);
    this.ws.onclose = () => {
      this.ws = null;
      this.postMessage("DISCONNECTED");
      if (!this.intentionalDisconnect) {
        this.scheduleReconnect();
      }
    };
    
    this.ws.onerror = () =>
      this.postMessage("ERROR", new Error("WebSocket error"));
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= 10) return;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    this.reconnectAttempts++;
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (!this.ws) return;
    this.ws.close();
    this.ws = null;
  }

  private postMessage(type: MessageType, payload?: T[] | Error) {
    self.postMessage({ type, payload });
  }
}

new WebSocketClient({ wsUrl: "", maxItems: 500 });
