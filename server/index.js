import dotenv from "dotenv";
dotenv.config();

import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (client) => {
  const cryptoWS = new WebSocket(
    `${process.env.CRYPTOCOMPARE_WS}?api_key=${process.env.CRYPTOCOMPARE_API_KEY}`
  );

  cryptoWS.on("open", () => {
    cryptoWS.send(
      JSON.stringify({
        action: "SubAdd",
        subs: ["8~Binance~BTC~USDT"],
      })
    );
  });

  cryptoWS.on("message", (data) => {
    client.send(data.toString());
  });

  client.on("close", () => cryptoWS.close());
});

server.listen(4000, () => {
  console.log("🔐 Proxy WebSocket active on ws://localhost:4000");
});
