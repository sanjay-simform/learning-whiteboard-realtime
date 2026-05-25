import WebSocket from "ws";
import { getEventCodeForEvent, WSEvents } from "./events";

export class UserWsConnection {
  private readonly socketsByUser = new Map<number, Set<WebSocket>>();

  addConnection(userId: number, socket: WebSocket) {
    if (!this.socketsByUser.has(userId)) {
      this.socketsByUser.set(userId, new Set());
    }
    this.socketsByUser.get(userId)!.add(socket);
  }

  getConnections(userId: number): Set<WebSocket> | undefined {
    return this.socketsByUser.get(userId);
  }

  removeConnection(userId: number, socket: WebSocket) {
    const userSockets = this.socketsByUser.get(userId);
    if (userSockets) {
      userSockets.delete(socket);
      if (userSockets.size === 0) {
        this.socketsByUser.delete(userId);
      }
    }
  }

  emitJson(userId: number, event: WSEvents, data: any) {
    const userSockets = this.socketsByUser.get(userId);
    if (userSockets) {
      const message = JSON.stringify({ event, data });
      for (const socket of userSockets) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(message);
        }
      }
    }
  }

  emitBinaryData(userId: number, event: WSEvents, data: Record<string, any>) {
    // first byte will be a simple event code, followed by JSON string of the data
    const userSockets = this.socketsByUser.get(userId);
    if (userSockets) {
      const eventCode = getEventCodeForEvent(event);
      const jsonData = JSON.stringify(data);
      const payload = Buffer.concat([
        Buffer.from([eventCode]),
        Buffer.from(jsonData, "utf-8"),
      ]);
      for (const socket of userSockets) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(payload);
        }
      }
    }
  }
}
export const userWsConnection = new UserWsConnection();
