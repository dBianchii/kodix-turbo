import { getAuthManager } from "@kodix/auth/auth-manager";

import { eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { authRepository } from "@kdx/db/repositories";
import { sessions, users } from "@kdx/db/schema";

import type { KdxAuthResponse, Session, User } from "./types";

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
      with: {
        ActiveTeam: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) return;

    return {
      ...user,
      activeTeamName: user.ActiveTeam.name,
      activeTeamId: user.ActiveTeam.id,
    };
  },
  findSessionById: async (sessionId): Promise<KdxAuthResponse> => {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: {
        User: {
          with: {
            ActiveTeam: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!session) return { user: null, session: null };

    const {
      User: { ActiveTeam, ...rest },
    } = session;

    return {
      session,
      user: {
        ...rest,
        activeTeamName: ActiveTeam.name,
        activeTeamId: ActiveTeam.id,
      },
    };
  },
});
