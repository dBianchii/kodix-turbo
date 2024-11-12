import type { z } from "zod";
import { eq } from "drizzle-orm";

import type { Update } from "./_types";
import type { zUserCreate, zUserUpdate } from "./_zodSchemas/userSchemas";
import { db as _db } from "../client";
import { users, usersToTeams } from "../schema";

export async function findUserByEmail(email: string, db = _db) {
  return db.query.users.findFirst({
    columns: {
      passwordHash: true, //! Bad: Exposing passwordHash sometimes when not needed
      activeTeamId: true,
      id: true,
      image: true,
    },
    where: (users, { and, eq }) => and(eq(users.email, email)),
  });
}

export async function findUserById(id: string, db = _db) {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, id),
    columns: {
      email: true,
    },
    with: {
      ExpoTokens: {
        columns: {
          token: true,
        },
      },
    },
  });
}

export async function createUser(user: z.infer<typeof zUserCreate>, db = _db) {
  await db.insert(users).values(user);
}

export async function updateUser(
  { id, input }: Update<typeof zUserUpdate>,
  db = _db,
) {
  await db.update(users).set(input).where(eq(users.id, id));
}

export async function moveUserToTeam(
  { userId, newTeamId }: { userId: string; newTeamId: string },
  db = _db,
) {
  const isUserInTeam = await db.query.usersToTeams.findFirst({
    where: (usersToTeams, { and, eq }) =>
      and(eq(usersToTeams.userId, userId), eq(usersToTeams.teamId, newTeamId)),
    columns: { userId: true },
  });
  if (!isUserInTeam) throw new Error("User does not belong to team");

  await updateUser({ id: userId, input: { activeTeamId: newTeamId } }, db);
}

export async function moveUserToTeamAndAssociateToTeam(
  {
    userId,
    teamId,
  }: {
    userId: string;
    teamId: string;
  },
  db = _db,
) {
  await db.insert(usersToTeams).values({
    userId: userId,
    teamId: teamId,
  });
  await moveUserToTeam({ userId, newTeamId: teamId }, db);
}
