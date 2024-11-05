import type { z } from "zod";
import { and, eq } from "drizzle-orm";

import type { Drizzle, DrizzleTransaction } from "../client";
import type { zTeamCreate } from "./_zodSchemas/teamSchemas";
import { db } from "../client";
import { invitations, teams, usersToTeams } from "../schema";

export async function createTeamAndAssociateUser(
  db: DrizzleTransaction,
  userId: string,
  team: z.infer<typeof zTeamCreate>,
) {
  const [createdTeam] = await db.insert(teams).values(team).$returningId();
  if (!createdTeam) throw new Error("Failed to create team");

  await db.insert(usersToTeams).values({
    userId: userId,
    teamId: createdTeam.id,
  });
}

export async function findTeamsByUserId(userId: string) {
  return db.query.teams.findMany({
    with: {
      UsersToTeams: true,
    },
    where: (teams, { exists }) =>
      exists(
        db
          .select()
          .from(usersToTeams)
          .where(
            and(
              eq(usersToTeams.teamId, teams.id),
              eq(usersToTeams.userId, userId),
            ),
          ),
      ),
  });
}

export async function findInvitationByIdAndEmail({
  id,
  email,
}: {
  id: string;
  email: string;
}) {
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

export async function findInvitationByEmail(email: string) {
  return db.query.invitations.findFirst({
    where: (invitation, { eq }) => eq(invitation.email, email),
  });
}

export async function deleteInvitationById(db: Drizzle, id: string) {
  await db.delete(invitations).where(eq(invitations.id, id));
}
