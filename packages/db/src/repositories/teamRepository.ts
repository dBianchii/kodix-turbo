import type { z } from "zod";
import { and, asc, eq, inArray, not } from "drizzle-orm";

import type { KodixAppId } from "@kdx/shared";
import { appIdToAdminRole_defaultIdMap } from "@kdx/shared";

import type { Drizzle, DrizzleTransaction } from "../client";
import type { Update } from "./_types";
import type { zInvitationCreateMany } from "./_zodSchemas/invitationSchemas";
import type { zTeamAppRoleToUserCreateMany } from "./_zodSchemas/teamAppRoleToUserSchemas";
import type { zTeamCreate, zTeamUpdate } from "./_zodSchemas/teamSchemas";
import { db } from "../client";
import {
  appPermissions,
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
    with: {
      UsersToTeams: {
        columns: {
          userId: true,
        },
      },
    },
    columns: { id: true, ownerId: true, name: true },
  });
}

export async function findTeamWithUsersAndInvitations({
  teamId,
  email,
}: {
  teamId: string;
  email: string[];
}) {
  const team = await db.query.teams.findFirst({
    where: (teams, { and, eq }) => and(eq(teams.id, teamId)),
    columns: {
      name: true,
      id: true,
    },
    with: {
      UsersToTeams: {
        with: {
          User: {
            columns: {
              email: true,
            },
          },
        },
      },
      Invitations: {
        where: (invitations, { inArray }) => inArray(invitations.email, email),
        columns: {
          email: true,
        },
      },
    },
  });

  return team;
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

export async function findAppPermissionsForTeam({
  teamId,
  appId,
}: {
  teamId: string;
  appId: string;
}) {
  const teamAppRolesIdsForTeamIdQuery = db
    .select({ id: teamAppRoles.id })
    .from(teamAppRoles)
    .where(eq(teamAppRoles.teamId, teamId));

  const permissions = await db.query.appPermissions.findMany({
    where: (appPermission, { eq, and }) => and(eq(appPermission.appId, appId)),
    orderBy: asc(appPermissions.editable),
    with: {
      AppPermissionsToTeamAppRoles: {
        where: (appPermissionToTeamAppRole, { inArray }) =>
          inArray(
            appPermissionToTeamAppRole.teamAppRoleId,
            teamAppRolesIdsForTeamIdQuery,
          ),
        with: {
          TeamAppRole: {
            columns: {
              id: true,
            },
          },
        },
      },
    },
  });

  return permissions;
}

export async function getUsersWithRoles({
  teamId,
  appId,
}: {
  teamId: string;
  appId: string;
}) {
  return await db.query.users.findMany({
    where: (users, { eq, inArray }) =>
      inArray(
        users.id,
        db
          .select({ id: usersToTeams.userId })
          .from(usersToTeams)
          .where(eq(usersToTeams.teamId, teamId)),
      ),
    with: {
      TeamAppRolesToUsers: {
        where: (teamAppRolesToUsers, { inArray }) =>
          inArray(
            teamAppRolesToUsers.teamAppRoleId,
            db
              .select({ id: teamAppRoles.id })
              .from(teamAppRoles)
              .where(
                and(
                  eq(teamAppRoles.teamId, teamId),
                  eq(teamAppRoles.appId, appId),
                ),
              ),
          ),
        with: {
          TeamAppRole: {
            columns: {
              id: true,
            },
          },
        },
        columns: {
          teamAppRoleId: true,
          userId: true,
        },
      },
    },
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });
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

export async function deleteTeam(db: Drizzle, id: string) {
  await db.delete(teams).where(eq(teams.id, id));
}

export async function removeUserAssociationsFromTeamAppRolesByTeamId(
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

export async function removeUserAssociationsFromTeamAppRolesByTeamIdAndAppId(
  db: Drizzle,
  { teamId, userId, appId }: { teamId: string; userId: string; appId: string },
) {
  const teamAppRolesForTeamAndAppQuery = db
    .select({ id: teamAppRoles.id })
    .from(teamAppRoles)
    .where(and(eq(teamAppRoles.appId, appId), eq(teamAppRoles.teamId, teamId)));

  return db
    .delete(teamAppRolesToUsers)
    .where(
      and(
        eq(teamAppRolesToUsers.userId, userId),
        inArray(
          teamAppRolesToUsers.teamAppRoleId,
          teamAppRolesForTeamAndAppQuery,
        ),
      ),
    );
}

export async function findAdminTeamAppRolesForApp(
  db: Drizzle,
  {
    appId,
  }: {
    appId: KodixAppId;
  },
) {
  const adminTeamAppRolesForApp = await db
    .select({ id: teamAppRoles.id })
    .from(teamAppRoles)
    .where(
      eq(teamAppRoles.appRoleDefaultId, appIdToAdminRole_defaultIdMap[appId]),
    );
  return adminTeamAppRolesForApp;
}

export async function findManyTeamAppRolesByTeamAndApp({
  teamId,
  appId,
}: {
  teamId: string;
  appId: string;
}) {
  return await db.query.teamAppRoles.findMany({
    where: (role, { and, eq }) =>
      and(eq(role.teamId, teamId), eq(role.appId, appId)),
    columns: {
      id: true,
      appRoleDefaultId: true,
    },
  });
}

export async function findManyTeamAppRolesByTeamAndAppAndUser({
  teamId,
  appId,
  userId,
}: {
  teamId: string;
  appId: string;
  userId: string;
}) {
  return await db.query.teamAppRoles.findMany({
    where: (teamAppRole, { eq, and, inArray }) =>
      and(
        eq(teamAppRole.teamId, teamId),
        eq(teamAppRole.appId, appId),
        inArray(
          teamAppRole.id,
          db
            .select({ id: teamAppRolesToUsers.teamAppRoleId })
            .from(teamAppRolesToUsers)
            .where(eq(teamAppRolesToUsers.userId, userId)),
        ),
      ),
    columns: {
      appRoleDefaultId: true,
    },
  });
}

export async function associateManyAppRolesToUsers(
  db: Drizzle,
  data: z.infer<typeof zTeamAppRoleToUserCreateMany>,
) {
  await db.insert(teamAppRolesToUsers).values(data);
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

export async function createManyInvitations(
  db: Drizzle,
  data: z.infer<typeof zInvitationCreateMany>,
) {
  await db.insert(invitations).values(data);
}

export async function findInvitationByEmail(email: string) {
  return db.query.invitations.findFirst({
    where: (invitation, { eq }) => eq(invitation.email, email),
  });
}

export async function findManyInvitationsByTeamId(teamId: string) {
  return db.query.invitations.findMany({
    where: (invitation, { eq }) => eq(invitation.teamId, teamId),
    columns: {
      id: true,
      email: true,
    },
  });
}

export async function findManyInvitationsByEmail(email: string) {
  return db.query.invitations.findMany({
    where: (invitation, { eq }) => eq(invitation.email, email),
    columns: {
      id: true,
    },
    with: {
      Team: {
        columns: {
          id: true,
          name: true,
        },
      },
      InvitedBy: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

export async function findInvitationById(id: string) {
  return db.query.invitations.findFirst({
    where: (invitation, { eq }) => eq(invitation.id, id),
  });
}

export async function findInvitationByIdAndTeamId({
  id,
  teamId,
}: {
  id: string;
  teamId: string;
}) {
  return db.query.invitations.findFirst({
    where: (invitation, { and, eq }) =>
      and(eq(invitation.id, id), eq(invitation.teamId, teamId)),
  });
}

export async function deleteInvitationById(db: Drizzle, id: string) {
  await db.delete(invitations).where(eq(invitations.id, id));
}

export async function updateTeamById(
  db: Drizzle,
  { id, input }: Update<typeof zTeamUpdate>,
) {
  return db.update(teams).set(input).where(eq(teams.id, id));
}
