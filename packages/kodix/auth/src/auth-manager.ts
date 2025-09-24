/** biome-ignore-all lint/style/noMagicNumbers: <easy to understand> */

import { cookies, headers } from "next/headers";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { omit } from "es-toolkit";

import type { AuthResponse, BaseSession, BaseUser } from "./types";
import {
  generateSessionToken,
  SESSION_COOKIE_NAME,
  setSessionTokenCookie,
  verifyPasswordHash,
} from "./core";

const SESSION_DURATION = 1000 * 60 * 60 * 24 * 30; // 30 days
const SESSION_RENEWAL_WINDOW = 1000 * 60 * 60 * 24 * 7; // 7 days
const DEFAULT_IP_ADDRESS = "127.0.0.1";

const getSessionExpireTime = () => new Date(Date.now() + SESSION_DURATION);

class AuthError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

// Helper functions
const hashSessionToken = (token: string) =>
  encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

type AuthRepository<TUser extends BaseUser, TSession extends BaseSession> = {
  createSession: (session: TSession) => Promise<void>;
  findSessionById: (
    sessionId: string
  ) => Promise<AuthResponse<TUser, TSession>>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionById: (session: {
    id: string;
    input: Pick<TSession, "expiresAt">;
  }) => Promise<void>;
  findUserByEmail: (email: string) => Promise<TUser | undefined>;
};

export const getAuthManager = <
  TUser extends BaseUser,
  TSession extends BaseSession,
>(
  authRepository: AuthRepository<TUser, TSession>
) => {
  async function createSession(
    token: string,
    userId: string
  ): Promise<TSession> {
    const sessionId = hashSessionToken(token);
    const heads = await headers();

    const sessionData = {
      id: sessionId,
      userId,
      expiresAt: getSessionExpireTime(),
      ipAddress: heads.get("X-Forwarded-For") ?? DEFAULT_IP_ADDRESS,
      userAgent: heads.get("user-agent"),
    };

    const session = sessionData as TSession;
    await authRepository.createSession(session);
    return session;
  }

  async function renewSession(session: TSession, token: string) {
    const newExpiry = getSessionExpireTime();
    session.expiresAt = newExpiry;

    await Promise.all([
      authRepository.updateSessionById({
        id: session.id,
        input: { expiresAt: newExpiry },
      }),
      setSessionTokenCookie(token, newExpiry),
    ]);
  }

  async function validateSessionToken(token: string) {
    const sessionId = hashSessionToken(token);
    const response = await authRepository.findSessionById(sessionId);

    if (!response.session) {
      return { user: null, session: null };
    }

    const now = Date.now();
    const expiresAt = response.session.expiresAt.getTime();

    const isExpired = now >= expiresAt;
    if (isExpired) {
      await authRepository.deleteSession(response.session.id);
      return { user: null, session: null };
    }

    const timeLeft = expiresAt - now;
    if (timeLeft <= SESSION_RENEWAL_WINDOW) {
      await renewSession(response.session, token);
    }
    return response;
  }

  async function invalidateSession(sessionId: string) {
    await authRepository.deleteSession(sessionId);
  }

  async function createDbSessionAndCookie({ userId }: { userId: string }) {
    const token = generateSessionToken();
    const session = await createSession(token, userId);
    await setSessionTokenCookie(token, session.expiresAt);

    return session.id;
  }

  async function auth(): Promise<AuthResponse<TUser, TSession>> {
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

    if (!token) return { user: null, session: null };

    const response = await validateSessionToken(token);

    if (!(response.session && response.user)) {
      return { user: null, session: null };
    }

    return {
      session: response.session,
      user: response.user,
    };
  }

  /**
   * Validates a user's email and password. Returns the user's ID if successful.
   */
  async function validateUserEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const existingUser = await authRepository.findUserByEmail(email);

    if (!existingUser) {
      throw new AuthError("Invalid credentials", "INVALID_CREDENTIALS");
    }

    if (!existingUser.passwordHash) {
      throw new AuthError("Invalid credentials", "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await verifyPasswordHash(
      password,
      existingUser.passwordHash
    );

    if (!isPasswordValid) {
      throw new AuthError("Invalid credentials", "INVALID_CREDENTIALS");
    }

    return omit(existingUser, ["passwordHash"]);
  }

  return {
    createDbSessionAndCookie,
    invalidateSession,
    auth,
    validateUserEmailAndPassword,
  };
};
