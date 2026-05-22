import { decodeToken } from "utils/jwt.util";

import type { IncomingMessage } from "node:http";

function getTokenFromRequest(request: IncomingMessage) {
  const requestUrl = request.url ?? "";
  const parsedUrl = new URL(requestUrl, "http://localhost");
  const queryToken = parsedUrl.searchParams.get("token");

  if (queryToken) {
    return queryToken;
  }

  const authorizationHeader = request.headers["authorization"] as
    | string
    | string[]
    | undefined;
  if (typeof authorizationHeader === "string") {
    return authorizationHeader.replace(/^Bearer\s+/i, "");
  }

  if (Array.isArray(authorizationHeader) && authorizationHeader[0]) {
    return authorizationHeader[0].replace(/^Bearer\s+/i, "");
  }

  return null;
}

export const getUserFromRequest = async (
  request: IncomingMessage,
): Promise<{ userId: string } | null> => {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  return await decodeToken(token);
};
