export type WSEvents =
  | "connected"
  | "heartbeat:ack"
  | "heartbeat"
  | "cursor.update"
  | "board.join"
  | "board.leave";

export interface CursorUpdateEventData {
  x: number;
  y: number;
}

export const getEventCodeForEvent = (event: WSEvents): number => {
  switch (event) {
    case "connected":
      return 1;
    case "heartbeat:ack":
      return 2;
    case "heartbeat":
      return 3;
    case "cursor.update":
      return 4;
    case "board.join":
      return 5;
    case "board.leave":
      return 6;
    default:
      throw new Error(`Unknown event: ${event satisfies never}`);
  }
};
