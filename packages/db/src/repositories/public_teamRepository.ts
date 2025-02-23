import type { z } from "zod";

import type { zTeamCreate } from "./_zodSchemas/teamSchemas";
import { db as _db } from "../client";
import { teams, usersToTeams } from "../schema";

export function public_teamRepositoryFactory() {
  async function findInvitationByEmail(email: string, db = _db) {
    return db.query.invitations.findFirst({
      where: (invitation, { eq }) => eq(invitation.email, email),
    });
  }

  async function createTeamAndAssociateUser(
    userId: string,
    team: z.infer<typeof zTeamCreate>,
    db = _db,
  ) {
    const [createdTeam] = await db.insert(teams).values(team).$returningId();
    if (!createdTeam) throw new Error("Failed to create team");

    await db.insert(usersToTeams).values({
      userId: userId,
      teamId: createdTeam.id,
    });
  }

  return {
    findInvitationByEmail,
    createTeamAndAssociateUser,
  };
}
