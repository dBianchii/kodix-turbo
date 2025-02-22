import type { z } from "zod";
import { eq } from "drizzle-orm";

import type { Drizzle } from "../client";
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
      name: true,
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

export async function findManyUsersByIds(ids: string[], db = _db) {
  return await db.query.users.findMany({
    where: (users, { inArray }) => inArray(users.id, ids),
    columns: {
      name: true,
    },
  });
}

export async function createUser(
  db: Drizzle,
  user: z.infer<typeof zUserCreate>,
) {
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

export async function findInvitationByIdAndEmail(
  {
    id,
    email,
  }: {
    id: string;
    email: string;
  },
  db = _db,
) {
  return db.query.invitations.findFirst({
    where: (invitation, { and, eq }) =>
      and(eq(invitation.id, id), eq(invitation.email, email)),
    with: {
      Team: {
        columns: {
          id: true,
        },
      },
    },
  });
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
  await moveUserToTeam(db, { userId, newTeamId: teamId });
  await db.insert(usersToTeams).values({
    userId: userId,
    teamId: teamId,
  });
}
