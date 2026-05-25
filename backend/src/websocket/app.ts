import { WebSocketServer, ClientSocket } from "ws";
import type { IncomingMessage, Server } from "node:http";
import { userWsConnection } from "./user-ws-connection";
import { getUserFromRequest } from "./auth";
import { WSEvents } from "./events";
import { boardSocket } from "modules/board/board-websocket";

const HEARTBEAT_INTERVAL =
  Number(process.env.WS_HEARTBEAT_INTERVAL) || 30 * 1000;
const SEND_APP_HEARTBEAT = false;

export function createWebSocketServer(server: Server) {
  const wss = new WebSocketServer({
    server,

    path: "/ws",

    maxPayload: 1024 * 1024,

    perMessageDeflate: false,
  });

  startHeartbeat(wss);

  wss.on("connection", async (socket, request: IncomingMessage) => {
    const ws = socket as ClientSocket;
    const user = await getUserFromRequest(request);
    if (!user) {
      ws.close(1008, "Unauthorized");
      return;
    }
    const userId = +user.userId; // ensure userId is a number
    userWsConnection.addConnection(userId, ws);
    userWsConnection.emitJson(userId, "connected", {});
    ws.isAlive = true;
    ws.userId = userId;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
      ws.terminate();
    });

    ws.on("message", (data) => {
      try {
        // detect binary vs text message
        if (Buffer.isBuffer(data)) {
          boardSocket.handleBinarySocketEvent(data, ws.userId);
        }
        const text = typeof data === "string" ? data : data.toString();
        const msg: { event: WSEvents; data: Record<string, any> } =
          JSON.parse(text);
        if (msg.event.includes("board.") || msg.event.includes("cursor.")) {
          boardSocket.handleSocketEvents(msg.event, ws.userId, msg.data);
        }
      } catch (err) {}
    });

    ws.on("close", () => {
      userWsConnection.removeConnection(userId, ws);
    });
  });

  return wss;
}

function startHeartbeat(wss: WebSocketServer) {
  setInterval(() => {
    for (const socket of wss.clients) {
      const ws = socket as ClientSocket;

      if (!ws.isAlive) {
        ws.terminate();
        continue;
      }

      ws.isAlive = false;

      // Protocol-level ping (not visible to browser JS)
      ws.ping();

      // Optional application-level heartbeat visible to browser clients
      if (SEND_APP_HEARTBEAT) {
        try {
          ws.send(
            JSON.stringify({ event: "heartbeat", data: { ts: Date.now() } }),
          );
        } catch (err) {
          // ignore send errors; socket may be closing
        }
      }
    }
  }, HEARTBEAT_INTERVAL);
}
