import { KODIX_NOTIFICATION_FROM_EMAIL } from "@kodix/shared/constants";
import { getBaseUrl, getSuccessesAndErrors, nanoid } from "@kodix/shared/utils";
import { TRPCError } from "@trpc/server";

import type { invitations } from "@kdx/db/schema";
import type { TInviteInputSchema } from "@kdx/validators/trpc/team/invitation";
import { db } from "@kdx/db/client";
import { teamRepository } from "@kdx/db/repositories";
import TeamInvite from "@kdx/react-email/team-invite";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";
import { resend } from "../../../../sdks/email";

interface InviteOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TInviteInputSchema;
}

export const inviteHandler = async ({ ctx, input }: InviteOptions) => {
  const team = await teamRepository.findTeamWithUsersAndInvitations({
    email: input.to,
    teamId: input.teamId,
  });

  if (!team)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.No Team Found"),
    });

  const inTeamEmail = input.to.find((email) =>
    team.UsersToTeams.some((usersToTeams) => usersToTeams.User.email === email),
  );
  if (inTeamEmail)
    throw new TRPCError({
      code: "CONFLICT",
      message: ctx.t("api.User USER is already a member of this team", {
        user: inTeamEmail,
      }),
    });

  if (team.Invitations[0])
    throw new TRPCError({
      code: "CONFLICT",
      message: ctx.t("api.Invitation already sent to EMAIL", {
        email: team.Invitations[0].email,
      }),
    });

  const _invitations = input.to.map(
    (email) =>
      ({
        email,
        id: nanoid(),
        invitedById: ctx.auth.user.id,
        teamId: team.id,
      }) satisfies typeof invitations.$inferInsert,
  );

  const results = await Promise.allSettled(
    _invitations.map(async (invite) => {
      await resend.emails.send({
        from: KODIX_NOTIFICATION_FROM_EMAIL,
        react: TeamInvite({
          invitedByEmail: ctx.auth.user.email,
          invitedByUsername: ctx.auth.user.name,
          inviteFromIp: ctx.auth.session.ipAddress,
          inviteLink: `${getBaseUrl()}/team/invite/${invite.id}`,
          t: ctx.t,
          teamName: team.name,
          username: invite.email,
        }),
        subject: ctx.t("api.You have been invited to join a team on URL", {
          url: getBaseUrl(),
        }),
        to: invite.email,
      });
      return invite;
    }),
  );

  const { successes } = getSuccessesAndErrors(results);

  if (successes.length)
    await teamRepository.createManyInvitations(
      db,
      successes.map((success) => {
        // biome-ignore lint/style/noNonNullAssertion: <will never be undefined>
        return _invitations.find((x) => x.id === success.value.id)!;
      }),
    );

  const failedInvites = _invitations.filter(
    (invite) => !successes.find((x) => x.value.id === invite.id),
  );
  return {
    failures: failedInvites.map((f) => f.email),
    successes: successes.map((s) => s.value.email),
  };
};
