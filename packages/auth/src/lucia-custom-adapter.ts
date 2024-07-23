/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { Adapter, DatabaseSession, DatabaseUser } from "lucia";

import type { Drizzle } from "@kdx/db/client";
import { eq, lte } from "@kdx/db";
import { db } from "@kdx/db/client";
import * as schema from "@kdx/db/schema";

class KodixAdapter implements Adapter {
  db;
  sessionTable;
  userTable;
  teamTable;
  constructor(
    db: Drizzle,
    sessionTable: typeof schema.sessions,
    userTable: typeof schema.users,
    teamTable: typeof schema.teams,
  ) {
    this.db = db;
    this.sessionTable = sessionTable;
    this.userTable = userTable;
    this.teamTable = teamTable;
  }

  async getSessionAndUser(
    sessionId: string,
  ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const result = await this.db
      .select({
        user: this.userTable,
        session: this.sessionTable,
        team: this.teamTable,
      })
      .from(this.sessionTable)
      .innerJoin(
        this.userTable,
        eq(this.sessionTable.userId, this.userTable.id),
      )
      .innerJoin(
        this.teamTable,
        eq(this.teamTable.id, this.userTable.activeTeamId),
      )
      .where(eq(this.sessionTable.id, sessionId));
    if (!result[0]?.session) return [null, null];

    return [
      transformIntoDatabaseSession(result[0].session),
      transformIntoDatabaseUser(result[0].user, result[0].team.name),
    ];
  }
  async deleteSession(sessionId: string) {
    await this.db
      .delete(this.sessionTable)
      .where(eq(this.sessionTable.id, sessionId));
  }
  async deleteUserSessions(userId: string) {
    await this.db
      .delete(this.sessionTable)
      .where(eq(this.sessionTable.userId, userId));
  }
  async getUserSessions(userId: string) {
    const result = await this.db
      .select()
      .from(this.sessionTable)
      .where(eq(this.sessionTable.userId, userId));
    return result.map((val) => {
      return transformIntoDatabaseSession(val);
    });
  }
  async setSession(session: DatabaseSession) {
    await this.db.insert(this.sessionTable).values({
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
      ...session.attributes,
    });
  }
  async updateSessionExpiration(sessionId: string, expiresAt: Date) {
    await this.db
      .update(this.sessionTable)
      .set({
        expiresAt,
      })
      .where(eq(this.sessionTable.id, sessionId));
  }
  async deleteExpiredSessions() {
    await this.db
      .delete(this.sessionTable)
      .where(lte(this.sessionTable.expiresAt, new Date()));
  }
}
function transformIntoDatabaseSession(raw: any) {
  const { id, userId, expiresAt, ...attributes } = raw;
  return {
    userId,
    id,
    expiresAt,
    attributes,
  };
}
function transformIntoDatabaseUser(raw: any, activeTeamName: string) {
  const { id, ...attributes } = raw;
  return {
    id,
    attributes: {
      ...attributes,
      activeTeamName,
    },
  };
}

export const adapter = new KodixAdapter(
  db,
  schema.sessions,
  schema.users,
  schema.teams,
);
