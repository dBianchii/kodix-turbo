import { TRPCError } from "@trpc/server";
import { getTranslations } from "next-intl/server";

import { and, eq } from "@kdx/db";
import {
  accounts,
  invitations,
  sessions,
  teams,
  users,
  usersToTeams,
} from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface DeleteAccountOptions {
  ctx: TProtectedProcedureContext;
}

export const deleteAccountHandler = async ({ ctx }: DeleteAccountOptions) => {
  const _teams = await ctx.db.query.teams.findMany({
    with: {
      UsersToTeams: true,
    },
    where: (teams, { exists }) =>
      exists(
        ctx.db
          .select()
          .from(usersToTeams)
          .where(
            and(
              eq(usersToTeams.teamId, teams.id),
              eq(usersToTeams.userId, ctx.auth.user.id),
            ),
          ),
      ),
  });

  if (!_teams[0]) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR", //should never happen
    });
  }
  const t = await getTranslations({ locale: ctx.locale });

  if (_teams.length > 1) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t("api.To delete you account you must have only one team left"),
    });
  }
  if (_teams[0].UsersToTeams.length > 1)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t(
        "api.To delete your account first remove all other users from your team",
      ),
    });

  await ctx.db.transaction(async (tx) => {
    await tx.delete(accounts).where(eq(accounts.userId, ctx.auth.user.id));
    await tx
      .delete(invitations)
      .where(eq(invitations.invitedById, ctx.auth.user.id));
    await tx.delete(teams).where(eq(teams.ownerId, ctx.auth.user.id));
    await tx.delete(sessions).where(eq(sessions.userId, ctx.auth.user.id));
    await tx.delete(users).where(eq(users.id, ctx.auth.user.id));
  });
};
