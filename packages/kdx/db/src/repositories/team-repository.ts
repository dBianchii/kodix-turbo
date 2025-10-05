import type { AppRole } from "@kodix/shared/db";
import type { z } from "zod";
import { and, eq, inArray, not } from "drizzle-orm";

import type { Drizzle, DrizzleTransaction } from "../client";
import type { Update } from "./_types";
import type { zInvitationCreateMany } from "./_zodSchemas/invitationSchemas";
import type { zTeamCreate, zTeamUpdate } from "./_zodSchemas/teamSchemas";
import { db as _db } from "../client";
import {
  invitations,
  teams,
  users,
  usersToTeams,
  userTeamAppRoles,
} from "../schema";

export async function createTeamAndAssociateUser(
  db: DrizzleTransaction,
  userId: string,
  team: z.infer<typeof zTeamCreate>,
) {
  const [createdTeam] = await db.insert(teams).values(team).$returningId();
  if (!createdTeam) throw new Error("Failed to create team");

  await db.insert(usersToTeams).values({
    teamId: createdTeam.id,
    userId: userId,
  });
}

export async function findTeamById(teamId: string, db = _db) {
  return await db.query.teams.findFirst({
    columns: { id: true, name: true, ownerId: true },
    where: (team, { eq }) => eq(team.id, teamId),
    with: {
      UsersToTeams: {
        columns: {
          userId: true,
        },
      },
    },
  });
}

export async function findTeamWithUsersAndInvitations(
  {
    teamId,
    email,
  }: {
    teamId: string;
    email: string[];
  },
  db = _db,
) {
  const team = await db.query.teams.findFirst({
    columns: {
      id: true,
      name: true,
    },
    where: (teams, { and, eq }) => and(eq(teams.id, teamId)),
    with: {
      Invitations: {
        columns: {
          email: true,
        },
        where: (invitations, { inArray }) => inArray(invitations.email, email),
      },
      UsersToTeams: {
        with: {
          User: {
            columns: {
              email: true,
            },
          },
        },
      },
    },
  });

  return team;
}

export async function findAnyOtherTeamAssociatedWithUserThatIsNotTeamId(
  {
    userId,
    teamId,
  }: {
    userId: string;
    teamId: string;
  },
  db = _db,
) {
  const [otherTeam] = await db
    .select({ id: teams.id })
    .from(teams)
    .innerJoin(usersToTeams, eq(teams.id, usersToTeams.teamId))
    .where(and(not(eq(teams.id, teamId)), eq(usersToTeams.userId, userId)));
  return otherTeam;
}

export async function findTeamsByUserId(userId: string, db = _db) {
  return db.query.teams.findMany({
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
    with: {
      UsersToTeams: true,
    },
  });
}

export async function findAllTeamsWithAppInstalled(appId: string, db = _db) {
  const allTeamIdsWithKodixCareInstalled = await db.query.appsToTeams.findMany({
    columns: {
      teamId: true,
    },
    where: (appsToTeams, { eq }) => eq(appsToTeams.appId, appId),
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

export async function findUserRolesByTeamIdAndAppId(
  {
    teamId,
    appId,
    userId,
  }: {
    teamId: string;
    appId: string;
    userId: string;
  },
  db = _db,
) {
  const roles = await db.query.userTeamAppRoles.findMany({
    columns: {
      role: true,
    },
    where: (userTeamAppRoles, { eq, and }) =>
      and(
        eq(userTeamAppRoles.teamId, teamId),
        eq(userTeamAppRoles.appId, appId),
        eq(userTeamAppRoles.userId, userId),
      ),
  });
  return roles.map(({ role }) => role);
}

export async function getUsersWithRoles(
  {
    teamId,
    appId,
  }: {
    teamId: string;
    appId: string;
  },
  db: Drizzle = _db,
) {
  return db.query.users.findMany({
    columns: {
      email: true,
      id: true,
      image: true,
      name: true,
    },
    where: (users, { eq, inArray }) =>
      inArray(
        users.id,
        db
          .select({ id: usersToTeams.userId })
          .from(usersToTeams)
          .where(eq(usersToTeams.teamId, teamId)),
      ),
    with: {
      UserTeamAppRoles: {
        columns: {
          role: true,
          userId: true,
        },
        where: (userTeamAppRoles, { eq, and }) =>
          and(
            eq(userTeamAppRoles.appId, appId),
            eq(userTeamAppRoles.teamId, teamId),
          ),
      },
    },
  });
}

export async function removeUserFromTeam(
  db = _db,
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

export async function deleteTeam(db: Drizzle, id: string) {
  await db.delete(teams).where(eq(teams.id, id));
}

export async function removeUserAssociationsFromUserTeamAppRolesByTeamId(
  { teamId, userId }: { teamId: string; userId: string },
  db = _db,
) {
  return db
    .delete(userTeamAppRoles)
    .where(
      and(
        eq(userTeamAppRoles.userId, userId),
        eq(userTeamAppRoles.teamId, teamId),
      ),
    );
}

export async function removeUserAssociationsFromTeamAppRolesByTeamIdAndAppIdAndRoles(
  {
    teamId,
    userId,
    appId,
    roles,
  }: { teamId: string; userId: string; appId: string; roles: AppRole[] },
  db = _db,
) {
  return db
    .delete(userTeamAppRoles)
    .where(
      and(
        inArray(userTeamAppRoles.role, roles),
        eq(userTeamAppRoles.userId, userId),
        eq(userTeamAppRoles.teamId, teamId),
        eq(userTeamAppRoles.appId, appId),
      ),
    );
}

export async function associateManyAppRolesToUsers(
  data: (typeof userTeamAppRoles.$inferInsert)[],
  db = _db,
) {
  await db.insert(userTeamAppRoles).values(data);
}

export async function findAllTeamMembers(teamId: string, db = _db) {
  return await db
    .select({
      email: users.email,
      id: users.id,
      image: users.image,
      name: users.name,
    })
    .from(users)
    .innerJoin(usersToTeams, eq(usersToTeams.userId, users.id))
    .where(eq(usersToTeams.teamId, teamId));
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

export async function createManyInvitations(
  db = _db,
  data: z.infer<typeof zInvitationCreateMany>,
) {
  await db.insert(invitations).values(data);
}

export async function findInvitationByEmail(email: string, db = _db) {
  return db.query.invitations.findFirst({
    where: (invitation, { eq }) => eq(invitation.email, email),
  });
}

export async function findManyInvitationsByTeamId(teamId: string, db = _db) {
  return db.query.invitations.findMany({
    columns: {
      email: true,
      id: true,
    },
    where: (invitation, { eq }) => eq(invitation.teamId, teamId),
  });
}

export async function findManyInvitationsByEmail(email: string, db = _db) {
  return db.query.invitations.findMany({
    columns: {
      id: true,
    },
    where: (invitation, { eq }) => eq(invitation.email, email),
    with: {
      InvitedBy: {
        columns: {
          id: true,
          image: true,
          name: true,
        },
      },
      Team: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function findInvitationById(id: string, db = _db) {
  return db.query.invitations.findFirst({
    where: (invitation, { eq }) => eq(invitation.id, id),
  });
}

export async function findInvitationByIdAndTeamId(
  {
    id,
    teamId,
  }: {
    id: string;
    teamId: string;
  },
  db = _db,
) {
  return db.query.invitations.findFirst({
    where: (invitation, { and, eq }) =>
      and(eq(invitation.id, id), eq(invitation.teamId, teamId)),
  });
}

export async function deleteInvitationById(db = _db, id: string) {
  await db.delete(invitations).where(eq(invitations.id, id));
}

export async function updateTeamById(
  { id, input }: Update<typeof zTeamUpdate>,
  db = _db,
) {
  return db.update(teams).set(input).where(eq(teams.id, id));
}
