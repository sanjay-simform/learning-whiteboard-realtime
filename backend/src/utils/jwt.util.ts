import { ENV } from "config/env";
import * as jose from "jose";

export const generateToken = async (userId: string): Promise<string> => {
  const secretKey = new TextEncoder().encode(ENV.JWT_SECRET);
  const token = await new jose.SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("2h")
    .sign(secretKey);

  return token;
};
export const decodeToken = async (
  token: string,
): Promise<{ userId: string } | null> => {
  try {
    const secretKey = new TextEncoder().encode(ENV.JWT_SECRET);
    const { payload } = await jose.jwtVerify<{ userId: string }>(
      token,
      secretKey,
    );
    return { userId: payload.userId };
  } catch (error) {
    return null;
  }
};
