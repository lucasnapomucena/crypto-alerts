import http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { throttle } from "./utils/throttle";

const BYBIT_WS_URL = "wss://stream.bybit.com/v5/public/spot";

const PAIRS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "AVAXUSDT",
];

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

  let bybitWS: WebSocket | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;

  function connect() {
    bybitWS = new WebSocket(BYBIT_WS_URL);

    bybitWS.on("open", () => {
      reconnectAttempts = 0;
      console.log("✅ Bybit connected");
      bybitWS!.send(
        JSON.stringify({
          op: "subscribe",
          args: PAIRS.map((p) => `publicTrade.${p}`),
        })
      );
    });

    bybitWS.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (!msg.topic?.startsWith("publicTrade.") || !Array.isArray(msg.data)) return;

        for (const trade of msg.data) {
          const fsym = (trade.s as string).replace("USDT", "");
          const transaction = {
            TYPE: "trade",
            M: "Bybit",
            FSYM: fsym,
            TSYM: "USDT",
            SIDE: trade.S === "Buy" ? 1 : 2,
            ACTION: 1,
            CCSEQ: trade.T,
            P: parseFloat(trade.p),
            Q: parseFloat(trade.v),
            SEQ: trade.T,
            REPORTEDNS: trade.T * 1_000_000,
            DELAYNS: 0,
          };
          sendThrottled(fsym, JSON.stringify(transaction));
        }
      } catch {
        // ignore malformed messages
      }
    });

    bybitWS.on("error", (err) => {
      console.error("❌ Bybit WS error:", err.message);
    });

    bybitWS.on("close", () => {
      bybitWS = null;
      if (client.readyState !== WebSocket.OPEN) return;

      const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
      reconnectAttempts++;
      console.log(`⚠️  Bybit disconnected. Reconnecting in ${delay / 1000}s...`);
      reconnectTimeout = setTimeout(connect, delay);
    });
  }

  connect();

  client.on("close", () => {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    bybitWS?.terminate();
  });
});

const PORT = parseInt(process.env.PORT ?? "4000");
server.listen(PORT, () => {
  console.log(`🔐 Proxy WebSocket active on ws://localhost:${PORT}`);
});
