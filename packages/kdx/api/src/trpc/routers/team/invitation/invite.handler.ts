import { KODIX_NOTIFICATION_FROM_EMAIL } from "@kodix/shared/constants";
import { TRPCError } from "@trpc/server";

import type { invitations } from "@kdx/db/schema";
import type { TInviteInputSchema } from "@kdx/validators/trpc/team/invitation";
import { db } from "@kdx/db/client";
import { nanoid } from "@kdx/db/nanoid";
import { teamRepository } from "@kdx/db/repositories";
import TeamInvite from "@kdx/react-email/team-invite";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";
import {
  getBaseUrl,
  getSuccessesAndErrors,
} from "../../../../../../../kodix/shared/src/utils";
import { resend } from "../../../../sdks/email";

interface InviteOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TInviteInputSchema;
}

export const inviteHandler = async ({ ctx, input }: InviteOptions) => {
  const team = await teamRepository.findTeamWithUsersAndInvitations({
    teamId: input.teamId,
    email: input.to,
  });

  if (!team)
    throw new TRPCError({
      message: ctx.t("api.No Team Found"),
      code: "NOT_FOUND",
    });

  const inTeamEmail = input.to.find((email) =>
    team.UsersToTeams.some((usersToTeams) => usersToTeams.User.email === email),
  );
  if (inTeamEmail)
    throw new TRPCError({
      message: ctx.t("api.User USER is already a member of this team", {
        user: inTeamEmail,
      }),
      code: "CONFLICT",
    });

  if (team.Invitations[0])
    throw new TRPCError({
      message: ctx.t("api.Invitation already sent to EMAIL", {
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
        invitedById: ctx.auth.user.id,
      }) satisfies typeof invitations.$inferInsert,
  );

  const results = await Promise.allSettled(
    _invitations.map(async (invite) => {
      await resend.emails.send({
        from: KODIX_NOTIFICATION_FROM_EMAIL,
        to: invite.email,
        subject: ctx.t("api.You have been invited to join a team on URL", {
          url: getBaseUrl(),
        }),
        react: TeamInvite({
          inviteFromIp: ctx.auth.session.ipAddress,
          username: invite.email,
          invitedByEmail: ctx.auth.user.email,
          invitedByUsername: ctx.auth.user.name,
          inviteLink: `${getBaseUrl()}/team/invite/${invite.id}`,
          teamName: team.name,
          t: ctx.t,
        }),
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
    successes: successes.map((s) => s.value.email),
    failures: failedInvites.map((f) => f.email),
  };
};
