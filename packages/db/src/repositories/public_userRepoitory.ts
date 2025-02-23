import type { z } from "zod";
import { and, eq } from "drizzle-orm";

import type { Update } from "./_types";
import type { zUserCreate, zUserUpdate } from "./_zodSchemas/userSchemas";
import { db as _db } from "../client";
import { invitations, users, usersToTeams } from "../schema";

export function public_userRepositoryFactory() {
  async function createUser(user: z.infer<typeof zUserCreate>, db = _db) {
    await db.insert(users).values(user);
  }

  async function deleteInvitationById(id: string, db = _db) {
    await db.delete(invitations).where(eq(invitations.id, id));
  }

  async function findInvitationById(id: string, db = _db) {
    return db.query.invitations.findFirst({
      where: (invitation, { eq }) => eq(invitation.id, id),
    });
  }

  async function findUserByEmail(email: string, db = _db) {
    return db.query.users.findFirst({
      columns: {
        passwordHash: true,
        activeTeamId: true,
        id: true,
        image: true,
      },
      where: (users, { and, eq }) => and(eq(users.email, email)),
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

  async function removeUserFromTeam(
    {
      userId,
      teamId,
    }: {
      userId: string;
      teamId: string;
    },
    db = _db,
  ) {
    return db
      .delete(usersToTeams)
      .where(
        and(eq(usersToTeams.userId, userId), eq(usersToTeams.teamId, teamId)),
      );
  }

  async function findInvitationByIdAndEmail(
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

  async function findUserById(id: string, db = _db) {
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

  async function updateUser(
    { id, input }: Update<typeof zUserUpdate>,
    db = _db,
  ) {
    await db.update(users).set(input).where(eq(users.id, id));
  }

  async function moveUserToTeam(
    { userId, newTeamId }: { userId: string; newTeamId: string },
    db = _db,
  ) {
    return updateUser({ id: userId, input: { activeTeamId: newTeamId } }, db);
  }

  async function moveUserToTeamAndAssociateToTeam(
    {
      userId,
      teamId,
    }: {
      userId: string;
      teamId: string;
    },
    db = _db,
  ) {
    await moveUserToTeam({ userId, newTeamId: teamId }, db);
    await db.insert(usersToTeams).values({
      userId: userId,
      teamId: teamId,
    });
  }

  return {
    findUserById,
    removeUserFromTeam,
    moveUserToTeam,
    updateUser,
    moveUserToTeamAndAssociateToTeam,
    findInvitationByIdAndEmail,
    createUser,
    findUserByEmail,
    findManyInvitationsByEmail,
    deleteInvitationById,
    findInvitationById,
  };
}
