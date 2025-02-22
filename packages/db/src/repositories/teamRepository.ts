import type { z } from "zod";
import { and, eq, inArray, not } from "drizzle-orm";

import type { AppRole } from "@kdx/shared";

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
import {
  assertTeamIdInList,
  createWithinTeams,
  createWithinTeamsForTable,
} from "./utils";

export function teamRepositoryFactory(teamIds: string[]) {
  const withinTeams = createWithinTeams(teamIds);
  const withinTeamsUsersToTeams = createWithinTeamsForTable(
    teamIds,
    usersToTeams,
  );
  const withinTeamsUserTeamAppRoles = createWithinTeamsForTable(
    teamIds,
    userTeamAppRoles,
  );
  const withinTeamsInvitations = createWithinTeamsForTable(
    teamIds,
    invitations,
  );

  async function createTeamAndAssociateUser(
    db: DrizzleTransaction,
    userId: string,
    team: z.infer<typeof zTeamCreate>,
  ) {
    if (team.id && !teamIds.includes(team.id))
      throw new Error(`Team ID ${team.id} is not allowed.`);

    const [createdTeam] = await db.insert(teams).values(team).$returningId();
    if (!createdTeam) throw new Error("Failed to create team");

    await db.insert(usersToTeams).values({
      userId: userId,
      teamId: createdTeam.id,
    });
  }

  async function findTeamById(db = _db) {
    return await db.query.teams.findFirst({
      where: withinTeams(),
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

  async function findTeamWithUsersAndInvitations(email: string[], db = _db) {
    const team = await db.query.teams.findFirst({
      where: withinTeams(),
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
          where: (invitations, { inArray }) =>
            inArray(invitations.email, email),
          columns: {
            email: true,
          },
        },
      },
    });

    return team;
  }

  async function findAnyOtherTeamAssociatedWithUserThatIsNotTeamId(
    {
      userId,
    }: {
      userId: string;
    },
    db = _db,
  ) {
    const [otherTeam] = await db
      .select({ id: teams.id })
      .from(teams)
      .innerJoin(usersToTeams, eq(teams.id, usersToTeams.teamId))
      .where(and(not(withinTeams()), eq(usersToTeams.userId, userId)));
    return otherTeam;
  }

  async function findTeamsByUserId(userId: string, db = _db) {
    return db.query.teams.findMany({
      with: {
        UsersToTeams: true,
      },
      where: (_, { exists }) =>
        exists(
          db
            .select()
            .from(usersToTeams)
            .where(withinTeamsUsersToTeams(eq(usersToTeams.userId, userId))),
        ),
    });
  }

  async function findUserRolesByTeamIdAndAppId(
    {
      appId,
      userId,
    }: {
      appId: string;
      userId: string;
    },
    db = _db,
  ) {
    const roles = await db.query.userTeamAppRoles.findMany({
      where: (userTeamAppRoles, { eq }) =>
        withinTeamsUserTeamAppRoles(
          eq(userTeamAppRoles.appId, appId),
          eq(userTeamAppRoles.userId, userId),
        ),
      columns: {
        role: true,
      },
    });
    return roles.map(({ role }) => role);
  }

  async function getUsersWithRoles(
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
      where: (users, { inArray }) =>
        inArray(
          users.id,
          db
            .select({ id: usersToTeams.userId })
            .from(usersToTeams)
            .where(withinTeamsUsersToTeams()),
        ),
      with: {
        UserTeamAppRoles: {
          where: (userTeamAppRoles, { eq }) =>
            withinTeamsUserTeamAppRoles(
              eq(userTeamAppRoles.appId, appId),
              eq(userTeamAppRoles.teamId, teamId),
            ),
          columns: {
            role: true,
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

  async function removeUserFromTeam(db = _db, userId: string) {
    return db
      .delete(usersToTeams)
      .where(withinTeamsUsersToTeams(eq(usersToTeams.userId, userId)));
  }

  async function deleteTeam(db: Drizzle, id: string) {
    await db.delete(teams).where(eq(teams.id, id));
  }

  async function removeUserAssociationsFromUserTeamAppRolesByTeamId(
    { userId }: { userId: string },
    db = _db,
  ) {
    return db
      .delete(userTeamAppRoles)
      .where(withinTeamsUserTeamAppRoles(eq(userTeamAppRoles.userId, userId)));
  }

  async function removeUserAssociationsFromTeamAppRolesByTeamIdAndAppIdAndRoles(
    {
      userId,
      appId,
      roles,
    }: { userId: string; appId: string; roles: AppRole[] },
    db = _db,
  ) {
    return db
      .delete(userTeamAppRoles)
      .where(
        withinTeamsUserTeamAppRoles(
          inArray(userTeamAppRoles.role, roles),
          eq(userTeamAppRoles.userId, userId),
          eq(userTeamAppRoles.appId, appId),
        ),
      );
  }

  async function associateManyAppRolesToUsers(
    data: (typeof userTeamAppRoles.$inferInsert)[],
    db = _db,
  ) {
    for (const item of data) assertTeamIdInList(item, teamIds);
    await db.insert(userTeamAppRoles).values(data);
  }

  async function findAllTeamMembers(teamId: string, db = _db) {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
      })
      .from(users)
      .innerJoin(usersToTeams, eq(usersToTeams.userId, users.id))
      .where(withinTeamsUsersToTeams());
  }

  async function createManyInvitations(
    db = _db,
    data: z.infer<typeof zInvitationCreateMany>,
  ) {
    for (const item of data) assertTeamIdInList(item, teamIds);
    await db.insert(invitations).values(data);
  }

  async function findInvitationByEmail(email: string, db = _db) {
    return db.query.invitations.findFirst({
      where: (invitation, { eq }) => eq(invitation.email, email),
    });
  }

  async function findManyInvitationsByTeamId(teamId: string, db = _db) {
    return db.query.invitations.findMany({
      where: (invitation, { eq }) => eq(invitation.teamId, teamId),
      columns: {
        id: true,
        email: true,
      },
    });
  }

  async function findManyInvitationsByEmail(email: string, db = _db) {
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

  async function findInvitationByIdAndTeamId(
    {
      id,
    }: {
      id: string;
    },
    db = _db,
  ) {
    return db.query.invitations.findFirst({
      where: (invitation, { eq }) =>
        withinTeamsInvitations(eq(invitation.id, id)),
    });
  }

  async function updateTeamById(
    { input }: Update<typeof zTeamUpdate>,
    db = _db,
  ) {
    return db.update(teams).set(input).where(withinTeams());
  }

  return {
    createTeamAndAssociateUser,
    findTeamById,
    findTeamWithUsersAndInvitations,
    findAnyOtherTeamAssociatedWithUserThatIsNotTeamId,
    findTeamsByUserId,
    findUserRolesByTeamIdAndAppId,
    getUsersWithRoles,
    removeUserFromTeam,
    deleteTeam,
    removeUserAssociationsFromUserTeamAppRolesByTeamId,
    removeUserAssociationsFromTeamAppRolesByTeamIdAndAppIdAndRoles,
    associateManyAppRolesToUsers,
    findAllTeamMembers,
    createManyInvitations,
    findInvitationByEmail,
    findManyInvitationsByTeamId,
    findManyInvitationsByEmail,
    findInvitationById,
    findInvitationByIdAndTeamId,
    updateTeamById,
  };
}
