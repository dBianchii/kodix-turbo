import type { z } from "zod";
import { eq } from "drizzle-orm";

import type { Drizzle } from "../client";
import { db } from "../client";
import { users, usersToTeams } from "../schema";
import { zUserCreate, zUserUpdate } from "./zodSchemas/userSchemas";

export async function findUserByEmail(email: string) {
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

export async function createUser(
  db: Drizzle,
  user: z.infer<typeof zUserCreate>,
) {
  await db.insert(users).values(zUserCreate.parse(user));
}

export async function updateUser(
  db: Drizzle,
  user: z.infer<typeof zUserUpdate>,
) {
  await db
    .update(users)
    .set(zUserUpdate.parse(user))
    .where(eq(users.id, user.id));
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
  await updateUser(db, { id: userId, activeTeamId: teamId });
  await db.insert(usersToTeams).values({
    userId: userId,
    teamId: teamId,
  });
}
