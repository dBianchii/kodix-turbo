/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { MySqlDatabase } from "drizzle-orm/mysql-core";
import type { DatabaseSession, DatabaseUser } from "lucia";
import { DrizzleMySQLAdapter } from "@lucia-auth/adapter-drizzle";

import type { Drizzle } from "@kdx/db/client";
import { eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { schema } from "@kdx/db/schema";

class KodixAdapter extends DrizzleMySQLAdapter {
  constructor(
    db: MySqlDatabase<any, any, any>,
    sessionTable: typeof schema.sessions,
    userTable: typeof schema.users,
    teamsTable: typeof schema.teams,
  ) {
    super(db, sessionTable, userTable);
    this.kdx_db = db;
    this.kdx_sessionTable = sessionTable;
    this.kdx_userTable = userTable;
    this.kdx_teamsTable = teamsTable;
  }

  private kdx_db: Drizzle;
  private kdx_sessionTable: typeof schema.sessions;
  private kdx_userTable: typeof schema.users;
  private kdx_teamsTable: typeof schema.teams;

  async getSessionAndUser(
    sessionId: string,
  ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const result = await this.kdx_db
      .select({
        user: this.kdx_userTable,
        session: this.kdx_sessionTable,
        team: this.kdx_teamsTable,
      })
      .from(this.kdx_sessionTable)
      .innerJoin(
        this.kdx_userTable,
        eq(this.kdx_sessionTable.userId, this.kdx_userTable.id),
      )
      .innerJoin(
        this.kdx_teamsTable,
        eq(this.kdx_userTable.activeTeamId, this.kdx_teamsTable.id),
      )
      .where(eq(this.kdx_sessionTable.id, sessionId));
    if (!result[0]) return [null, null];

    return [
      transformIntoDatabaseSession(result[0].session),
      transformIntoDatabaseUser(result[0].user, result[0].team),
    ];
  }
}
function transformIntoDatabaseSession(raw: any): DatabaseSession {
  const { id, userId, expiresAt, ...attributes } = raw;
  return {
    userId,
    id,
    expiresAt,
    attributes,
  };
}
function transformIntoDatabaseUser(raw: any, team: any): DatabaseUser {
  const { id, ...attributes } = raw;
  return {
    id,
    attributes: {
      ...attributes,
      activeTeamName: team.name,
    },
  };
}

export const adapter = new KodixAdapter(
  db,
  schema.sessions,
  schema.users,
  schema.teams,
);
