import { db } from "@cash/db/client";
import { authRepository } from "@cash/db/repositories";
import { sessions, users } from "@cash/db/schema";
import { getAuthManager } from "@kodix/auth/auth-manager";
import { eq } from "drizzle-orm";

import type { CashAuthResponse, Session, User } from "./types";

export const {
  auth,
  createDbSessionAndCookie,
  validateUserEmailAndPassword,
  invalidateSession,
} = getAuthManager<User, Session>({
  ...authRepository,
  findUserByEmail: async (email: string): Promise<User | undefined> => {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) return;

    return {
      ...user,
    };
  },
  findSessionById: async (sessionId): Promise<CashAuthResponse> => {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: {
        User: true,
      },
    });

    if (!session) return { user: null, session: null };

    return {
      session,
      user: session.User,
    };
  },
});
