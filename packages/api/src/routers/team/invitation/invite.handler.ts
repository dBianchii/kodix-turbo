/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TRPCError } from "@trpc/server";

import type { TInviteInputSchema } from "@kdx/validators/trpc/team/invitation";
import { nanoid } from "@kdx/db/nanoid";
import { invitations } from "@kdx/db/schema";
import { getTranslations } from "@kdx/locales/next-intl/server";
import TeamInvite from "@kdx/react-email/team-invite";
import {
  getBaseUrl,
  getSuccessesAndErrors,
  kodixNotificationFromEmail,
} from "@kdx/shared";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";
import { resend } from "../../../utils/email";

interface InviteOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TInviteInputSchema;
}

export const inviteHandler = async ({ ctx, input }: InviteOptions) => {
  const team = await ctx.db.query.teams.findFirst({
    where: (teams, { and, eq }) => and(eq(teams.id, input.teamId)),
    columns: {
      name: true,
      id: true,
    },
    with: {
      UsersToTeams: {
        // where: (usersToTeams, { eq }) =>
        //   eq(usersToTeams.userId, ctx.session.user.id),
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
          inArray(invitations.email, input.to),
        columns: {
          email: true,
        },
      },
    },
  });
  const t = await getTranslations({ locale: ctx.locale });

  if (!team)
    throw new TRPCError({
      message: t("api.No Team Found"),
      code: "NOT_FOUND",
    });

  const inTeamEmail = input.to.find((email) =>
    team.UsersToTeams.some((usersToTeams) => usersToTeams.User.email === email),
  );
  if (inTeamEmail)
    throw new TRPCError({
      message: t("api.User USER is already a member of this team", {
        user: inTeamEmail,
      }),
      code: "CONFLICT",
    });

  if (team.Invitations[0])
    throw new TRPCError({
      message: t("api.Invitation already sent to EMAIL", {
        email: team.Invitations[0].email,
      }),
      code: "CONFLICT",
    });

  const _invitations = input.to.map(
    (email) =>
      ({
        id: nanoid(),
        teamId: team.id,
        email,
        invitedById: ctx.session.user.id,
      }) satisfies typeof invitations.$inferInsert,
  );

  const results = await Promise.allSettled(
    _invitations.map(async (invite) => {
      await resend.emails.send({
        from: kodixNotificationFromEmail,
        to: invite.email,
        subject: t("api.You have been invited to join a team on URL", {
          url: getBaseUrl(),
        }),
        react: TeamInvite({
          invitedByEmail: ctx.session.user.email,
          invitedByUsername: ctx.session.user.name!,
          inviteLink: `${getBaseUrl()}/team/invite/${invite.id}`,
          teamImage: `${getBaseUrl()}/api/avatar/${team.name}`,
          teamName: team.name,
          // username: ??
        }),
      });
      return invite;
    }),
  );

  const { successes } = getSuccessesAndErrors(results);

  if (successes.length)
    await ctx.db.insert(invitations).values(
      successes.map((success) => {
        return _invitations.find((x) => x.id === success.value.id)!;
      }),
    );

  const failedInvites = _invitations.filter(
    (invite) => !successes.find((x) => x.value.id === invite.id),
  );
  return {
    successes: successes.map((s) => s.value.email),
    failures: failedInvites.map((f) => f.email),
  };
};
