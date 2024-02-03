import { TRPCError } from "@trpc/server";
import cuid from "cuid";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TInviteInputSchema } from "@kdx/validators/trpc/invitation";
import TeamInvite from "@kdx/react-email/team-invite";
import { getBaseUrl, getSuccessesAndErrors } from "@kdx/shared";

import { sendEmail } from "../../../internal/email/email";

interface InviteOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
  input: TInviteInputSchema;
}

export const inviteHandler = async ({ ctx, input }: InviteOptions) => {
  const team = await ctx.prisma.team.findUniqueOrThrow({
    where: {
      id: input.teamId,
      Users: {
        some: {
          id: ctx.session.user.id,
        },
      },
    },
    select: {
      name: true,
      id: true,
      Users: {
        select: {
          email: true,
        },
      },
      Invitations: {
        where: {
          email: {
            in: input.to,
          },
        },
        select: {
          email: true,
        },
      },
    },
  });

  const inTeamEmail = input.to.find((email) =>
    team.Users.find((x) => x.email === email),
  );
  if (inTeamEmail)
    throw new TRPCError({
      message: `User ${inTeamEmail} is already a member of this team`,
      code: "CONFLICT",
    });

  if (team.Invitations[0])
    throw new TRPCError({
      message: `Invitation already sent to ${team.Invitations[0].email}`,
      code: "CONFLICT",
    });

  const invitations = input.to.map((email) => ({
    id: cuid(),
    teamId: team.id,
    email,
  }));

  const results = await Promise.allSettled(
    invitations.map(async (invite) => {
      await sendEmail({
        from: "Kodix <notification@kodix.com.br>",
        to: invite.email,
        subject: "You have been invited to join a team on kodix.com.br",
        react: TeamInvite({
          invitedByEmail: ctx.session.user.email!,
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
    await ctx.prisma.invitation.createMany({
      data: successes.map((success) => {
        return invitations.find((x) => x.id === success.value.id)!;
      }),
    });

  const failedInvites = invitations.filter(
    (invite) => !successes.find((x) => x.value.id === invite.id),
  );
  return {
    successes: successes.map((s) => s.value.email),
    failures: failedInvites.map((f) => f.email),
  };
};