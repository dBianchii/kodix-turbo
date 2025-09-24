import { cookies } from "next/headers";
import { hash, type Options, verify } from "@node-rs/argon2";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

export const SESSION_TOKEN_LENGTH = 20;
export const SESSION_COOKIE_NAME = "session";

export const setSessionTokenCookie = async (token: string, expiresAt: Date) => {
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
};

export const deleteSessionTokenCookie = async () => {
  (await cookies()).set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
};

const argon2Config: Options = {
  // recommended minimum parameters
  memoryCost: 19_456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export function generateSessionToken() {
  const bytes = new Uint8Array(SESSION_TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export const generatePasswordHash = (password: string) =>
  hash(password, argon2Config);

export const verifyPasswordHash = (password: string, passwordHash: string) =>
  verify(password, passwordHash, argon2Config);
