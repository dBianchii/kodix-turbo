import { cookies, headers } from "next/headers";
import { verify } from "@node-rs/argon2";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";

import type { sessions, users } from "@kdx/db/schema";
import {
  public_authRepositoryFactory,
  public_userRepositoryFactory,
} from "@kdx/db/repositories";

import { env } from "../env";
import * as discordProvider from "./providers/discord";
import * as googleProvider from "./providers/google";

interface ExtraUserProps {
  activeTeamName: string;
}

export type User = typeof users.$inferSelect & ExtraUserProps;
export type Session = typeof sessions.$inferSelect;

export type AuthResponse =
  | {
      user: User;
      session: Session;
    }
  | { user: null; session: null };

export function generateSessionToken() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

const getSessionExpireTime = () =>
  new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

export async function createSession(token: string, userId: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const heads = await headers();
  const session = {
    id: sessionId,
    userId,
    expiresAt: getSessionExpireTime(),
    ipAddress: heads.get("X-Forwarded-For") ?? "127.0.0.1",
    userAgent: heads.get("user-agent"),
  };
  await public_authRepositoryFactory().createSession(session);
  return session;
}

async function validateSessionToken(token: string): Promise<AuthResponse> {
  const authRepository = public_authRepositoryFactory();

  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await authRepository.findUserTeamBySessionId({ sessionId });

  if (!result) return { session: null, user: null };
  const { user, session, team } = result;

  if (Date.now() >= session.expiresAt.getTime()) {
    await authRepository.deleteSession(session.id);
    return { session: null, user: null };
  }

  const fifteenDaysInMilliseconds = 1000 * 60 * 60 * 24 * 15;
  if (Date.now() >= session.expiresAt.getTime() - fifteenDaysInMilliseconds) {
    session.expiresAt = getSessionExpireTime();
    await authRepository.updateSession({
      id: session.id,
      input: {
        expiresAt: session.expiresAt,
      },
    });
  }
  return { session, user: { ...user, activeTeamName: team.name } };
}

export async function invalidateSession(sessionId: string) {
  await public_authRepositoryFactory().deleteSession(sessionId);
}
const SESSION_COOKIE_NAME = "session";
export async function setSessionTokenCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSessionTokenCookie() {
  (await cookies()).set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export const argon2Config = {
  // recommended minimum parameters
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

/**
 * Validates a user's email and password. Returns the user's ID if successful.
 */
export async function validateUserEmailAndPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const publicUserRepository = public_userRepositoryFactory();
  const existingUser = await publicUserRepository.findUserByEmail(email);
  if (!existingUser) {
    // NOTE:
    // Returning immediately allows malicious actors to figure out valid usernames from response times,
    // allowing them to only focus on guessing passwords in brute-force attacks.
    // As a preventive measure, you may want to hash passwords even for invalid usernames.
    // However, valid usernames can be already be revealed with the signup page among other methods.
    // It will also be much more resource intensive.
    // Since protecting against this is non-trivial,
    // it is crucial your implementation is protected against brute-force attacks with login throttling etc.
    // If usernames are public, you may outright tell the user that the username is invalid.
    throw new Error("Incorrect email or password");
  }
  if (!existingUser.passwordHash)
    throw new Error("Incorrect email or password");

  const validPassword = await verify(
    existingUser.passwordHash,
    password,
    argon2Config,
  );
  if (!validPassword) throw new Error("Incorrect email or password");

  /**Returns an object representing the validated user */
  return {
    id: existingUser.id,
    activeTeamId: existingUser.activeTeamId,
  };
}

export const auth = async () => {
  const token = (await cookies()).get("session")?.value ?? null;

  if (token === null) return { session: null, user: null };

  const result = await validateSessionToken(token);
  return result;
};

export const providers = {
  discord: discordProvider,
  google: googleProvider,
} as const;

export type Providers = keyof typeof providers;
