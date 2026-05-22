import { RingBufferPool } from "utils/ring-buffer-pool";
import { getEventCodeForEvent, WSEvents } from "websocket/events";
import { userWsConnection } from "websocket/user-ws-connection";

export class BoardSocket {
  boards: Map<number, Set<string>> = new Map();
  cursorBuffers = new RingBufferPool(14, 4096);

  subscribe(userId: string, boardId: number) {
    if (!this.boards.has(boardId)) {
      this.boards.set(boardId, new Set());
    }
    this.boards.get(boardId)!.add(userId);
  }

  unsubscribe(userId: string, boardId: number) {
    const boardUsers = this.boards.get(boardId);
    if (boardUsers) {
      boardUsers.delete(userId);
      if (boardUsers.size === 0) {
        this.boards.delete(boardId);
      }
    }
  }

  getSubscribers(boardId: number): Set<string> {
    return this.boards.get(boardId) || new Set();
  }

  boardJoined(
    currentUserId: string,
    boardId: number,
    metadata: Record<string, any>,
  ) {
    this.subscribe(currentUserId, boardId);
    this.broadCastToBoardMembers(currentUserId, boardId, "board.join", {
      type: "join",
      userId: currentUserId,
      metadata,
    });
  }

  broadCastToBoardMembers(
    currentUserId: string,
    boardId: number,
    event: WSEvents,
    data: Record<string, any>,
  ) {
    const subscribers = this.getSubscribers(boardId);

    for (const userId of subscribers) {
      if (userId !== currentUserId) {
        userWsConnection.emitJson(userId, event, data);
      }
    }
  }

  broadcastCursorUpdate(
    currentUserId: string,
    boardId: number,
    cursorData: { x: number; y: number; userId: number },
  ) {
    const buffer = this.cursorBuffers.next();

    let offset = 0;

    buffer.writeUInt8(getEventCodeForEvent("cursor.update"), offset);
    offset += 1;

    buffer.writeUInt32BE(boardId, offset);
    offset += 4;
    buffer.writeUInt16BE(cursorData.x, offset);
    offset += 2;
    buffer.writeUInt16BE(cursorData.y, offset);
    offset += 2;
    buffer.writeUInt32BE(cursorData.userId, offset);
    offset += 4;

    buffer.writeUInt8(0, offset);

    const users = this.getSubscribers(boardId);
    for (const userId of users) {
      if (userId !== currentUserId) {
        const userSocket = userWsConnection.getConnections(userId);
        if (userSocket.size === 0) {
          continue;
        }
        for (const ws of userSocket) {
          ws.send(buffer, {
            binary: true,
            compress: false,
          });
        }
      }
    }
  }

  broadcastCursorUpdateBinary(
    currentUserId: string,
    boardId: number,
    data: Buffer,
  ) {
    // broadcast to all other users on the board the raw binary data as it is without parsing it on the server
    const users = this.getSubscribers(boardId);
    for (const userId of users) {
      if (userId !== currentUserId) {
        const userSocket = userWsConnection.getConnections(userId);
        if (userSocket.size === 0) {
          continue;
        }
        for (const ws of userSocket) {
          ws.send(data, {
            binary: true,
            compress: false,
          });
        }
      }
    }
  }

  handleSocketEvents(
    event: WSEvents,
    userId: string,
    data: Record<string, any>,
  ) {
    switch (event) {
      case "board.join":
        this.boardJoined(userId, +data.boardId, data.metadata);
        break;

      case "cursor.update":
        this.broadcastCursorUpdate(userId, +data.boardId, data.cursorData);
        break;

      case "board.leave":
        this.unsubscribe(userId, +data.boardId);
        this.broadCastToBoardMembers(userId, +data.boardId, "board.leave", {
          type: "leave",
          userId,
        });
        break;

      default:
        break;
    }
  }

  handleBinarySocketEvent(data: Buffer, userId: string) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const eventCode = view.getUint8(0);

    switch (eventCode) {
      case getEventCodeForEvent("cursor.update"):
        const boardId = view.getUint16(7);
        this.broadcastCursorUpdateBinary(userId, boardId, data);
        break;

      default:
        break;
    }
  }
}

export const boardSocket = new BoardSocket();
