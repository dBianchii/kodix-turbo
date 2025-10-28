import type { z } from "zod";
import { eq, inArray } from "drizzle-orm";

import type { Drizzle } from "../client";
import type { Update } from "./_types";
import type { zUserCreate, zUserUpdate } from "./_zodSchemas/user-schemas";
import { db as _db } from "../client";
import { users, usersToTeams } from "../schema";

export function findUserByEmail(email: string, db = _db) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function findUserById(id: string, db = _db) {
  return await db.query.users.findFirst({
    columns: {
      email: true,
      name: true,
    },
    where: eq(users.id, id),
    with: {
      ExpoTokens: {
        columns: {
          token: true,
        },
      },
    },
  });
}

export function findManyUsersByIds(ids: string[], db = _db) {
  return db.query.users.findMany({
    columns: {
      name: true,
    },
    where: inArray(users.id, ids),
  });
}

export async function createUser(user: z.infer<typeof zUserCreate>, db = _db) {
  await db.insert(users).values(user);
}

export async function updateUser(
  db: Drizzle,
  { id, input }: Update<typeof zUserUpdate>,
) {
  await db.update(users).set(input).where(eq(users.id, id));
}

export async function moveUserToTeam(
  db: Drizzle,
  { userId, newTeamId }: { userId: string; newTeamId: string },
) {
  //TODO: Enforce user is allowed to do it!!!
  await updateUser(db, { id: userId, input: { activeTeamId: newTeamId } });
}

export async function moveUserToTeamAndAssociateToTeam(
  db: Drizzle,
  {
    userId,
    teamId,
  }: {
    userId: string;
    teamId: string;
  },
) {
  await moveUserToTeam(db, { newTeamId: teamId, userId });
  await db.insert(usersToTeams).values({
    teamId,
    userId,
  });
}
