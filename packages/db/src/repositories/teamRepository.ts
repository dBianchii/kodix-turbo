import type { z } from "zod";
import { and, eq, inArray, not } from "drizzle-orm";

import type { Drizzle, DrizzleTransaction } from "../client";
import type { zTeamCreate } from "./_zodSchemas/teamSchemas";
import { db } from "../client";
import {
  invitations,
  teamAppRoles,
  teamAppRolesToUsers,
  teams,
  users,
  usersToTeams,
} from "../schema";

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

export async function findTeamById(teamId: string) {
  return await db.query.teams.findFirst({
    where: (team, { eq }) => eq(team.id, teamId),
    columns: { id: true, ownerId: true },
  });
}

export async function findAnyOtherTeamAssociatedWithUserThatIsNotTeamId({
  userId,
  teamId,
}: {
  userId: string;
  teamId: string;
}) {
  const [otherTeam] = await db
    .select({ id: teams.id })
    .from(teams)
    .innerJoin(usersToTeams, eq(teams.id, usersToTeams.teamId))
    .where(and(not(eq(teams.id, teamId)), eq(usersToTeams.userId, userId)));
  return otherTeam;
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

export async function findAllTeamsWithAppInstalled(appId: string) {
  const allTeamIdsWithKodixCareInstalled = await db.query.appsToTeams.findMany({
    where: (appsToTeams, { eq }) => eq(appsToTeams.appId, appId),
    columns: {
      teamId: true,
    },
    with: {
      Team: {
        with: {
          UsersToTeams: {
            columns: {
              userId: true,
            },
          },
        },
      },
    },
  });

  return allTeamIdsWithKodixCareInstalled;
}

export async function removeUserFromTeam(
  db: Drizzle,
  {
    teamId,
    userId,
  }: {
    teamId: string;
    userId: string;
  },
) {
  return db
    .delete(usersToTeams)
    .where(
      and(eq(usersToTeams.teamId, teamId), eq(usersToTeams.userId, userId)),
    );
}

export async function removeUserAssociationsFromTeamAppRoles(
  db: Drizzle,
  { teamId, userId }: { teamId: string; userId: string },
) {
  return db
    .delete(teamAppRolesToUsers)
    .where(
      and(
        eq(teamAppRolesToUsers.userId, userId),
        inArray(
          teamAppRolesToUsers.teamAppRoleId,
          db
            .select({ id: teamAppRoles.id })
            .from(teamAppRoles)
            .where(eq(teamAppRoles.teamId, teamId)),
        ),
      ),
    );
}

export async function findAllTeamMembers(teamId: string) {
  return await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
    })
    .from(users)
    .innerJoin(usersToTeams, eq(usersToTeams.userId, users.id))
    .where(eq(usersToTeams.teamId, teamId));
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

export async function findInvitationById(id: string) {
  return db.query.invitations.findFirst({
    where: (invitation, { eq }) => eq(invitation.id, id),
  });
}

export async function deleteInvitationById(db: Drizzle, id: string) {
  await db.delete(invitations).where(eq(invitations.id, id));
}
