import { cookies, headers } from "next/headers";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";

import { eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { sessions, teams, users } from "@kdx/db/schema";

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

const thirtyDaysFromNow = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
export async function createSession(token: string, userId: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const heads = headers();
  const session = {
    id: sessionId,
    userId,
    expiresAt: thirtyDaysFromNow,
    ipAddress:
      heads.get("X-Forwarded-For") ??
      heads.get("X-Forwarded-For") ??
      "127.0.0.1",
    userAgent: heads.get("user-agent"),
  };
  await db.insert(sessions).values(session);
  return session;
}

async function validateSessionToken(token: string): Promise<AuthResponse> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: users, session: sessions, team: teams })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .innerJoin(teams, eq(teams.id, users.activeTeamId))
    .where(eq(sessions.id, sessionId));

  if (!result[0]) return { session: null, user: null };
  const { user, session, team } = result[0];

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return { session: null, user: null };
  }

  const fifteenDaysInMilliseconds = 1000 * 60 * 60 * 24 * 15;
  if (Date.now() >= session.expiresAt.getTime() - fifteenDaysInMilliseconds) {
    session.expiresAt = thirtyDaysFromNow;
    await db
      .update(sessions)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessions.id, session.id));
  }
  return { session, user: { ...user, activeTeamName: team.name } };
}

export async function invalidateSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

//* Cookies
export function setSessionTokenCookie(token: string, expiresAt: Date) {
  cookies().set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export function deleteSessionTokenCookie() {
  cookies().set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export const auth = async () => {
  const token = cookies().get("session")?.value ?? null;

  if (token === null) return { session: null, user: null };

  const result = await validateSessionToken(token);
  return result;
};

export const providers = {
  discord: discordProvider,
  google: googleProvider,
} as const;

export type Providers = keyof typeof providers;
