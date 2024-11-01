import type { z } from "zod";
import { eq } from "drizzle-orm";

import type {
  zSessionCreate,
  zSessionUpdate,
} from "./zodSchemas/sessionSchemas";
import { db } from "../client";
import { sessions, sessionSchema, teams, users } from "../schema";

export async function createSession(session: z.infer<typeof zSessionCreate>) {
  await db.insert(sessions).values(session);
}

export async function findUserTeamBySessionId({
  sessionId,
}: {
  sessionId: string;
}) {
  const [result] = await db
    .select({ user: users, session: sessions, team: teams })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .innerJoin(teams, eq(teams.id, users.activeTeamId))
    .where(eq(sessions.id, sessionId));

  return result;
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function updateSession(session: z.infer<typeof zSessionUpdate>) {
  await db
    .update(sessions)
    .set(sessionSchema.parse(session))
    .where(eq(sessions.id, session.id));
}
