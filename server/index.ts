import http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { throttle } from "./utils/throttle";

const PAIRS = [
  "btcusdt",
  "ethusdt",
  "bnbusdt",
  "solusdt",
  "xrpusdt",
  "adausdt",
  "dogeusdt",
  "avaxusdt",
];

const STREAMS = PAIRS.map((p) => `${p}@trade`).join("/");
const BINANCE_WS_URL = `wss://stream.binance.com:9443/stream?streams=${STREAMS}`;

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (client) => {
  const throttleMap = new Map<string, (data: string) => void>();
  const sendThrottled = (symbol: string, data: string) => {
    if (!throttleMap.has(symbol)) {
      throttleMap.set(symbol, throttle((d: string) => client.send(d), 500));
    }
    throttleMap.get(symbol)!(data);
  };

  let binanceWS: WebSocket | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;

  function connect() {
    binanceWS = new WebSocket(BINANCE_WS_URL);

    binanceWS.on("open", () => {
      reconnectAttempts = 0;
      console.log("✅ Binance connected");
    });

    binanceWS.on("message", (data) => {
      try {
        const { data: trade } = JSON.parse(data.toString());
        if (trade?.e !== "trade") return;

        const fsym = trade.s.replace("USDT", "");
        const transaction = {
          TYPE: "trade",
          M: "Binance",
          FSYM: fsym,
          TSYM: "USDT",
          SIDE: trade.m ? 2 : 1,
          ACTION: 1,
          CCSEQ: trade.t,
          P: parseFloat(trade.p),
          Q: parseFloat(trade.q),
          SEQ: trade.t,
          REPORTEDNS: trade.T * 1_000_000,
          DELAYNS: 0,
        };

        sendThrottled(fsym, JSON.stringify(transaction));
      } catch {
        // ignore malformed messages
      }
    });

    binanceWS.on("error", () => {});

    binanceWS.on("close", () => {
      binanceWS = null;
      if (client.readyState !== WebSocket.OPEN) return;

      const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
      reconnectAttempts++;
      console.log(`⚠️  Binance disconnected. Reconnecting in ${delay / 1000}s...`);
      reconnectTimeout = setTimeout(connect, delay);
    });
  }

  connect();

  client.on("close", () => {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    binanceWS?.terminate();
  });
});

const PORT = parseInt(process.env.PORT ?? "4000");
server.listen(PORT, () => {
  console.log(`🔐 Proxy WebSocket active on ws://localhost:${PORT}`);
});
