import { TRPCError } from "@trpc/server";
import cuid from "cuid";
import { z } from "zod";

import {
  getBaseUrl,
  getSuccessesAndErrors,
  inviteUserSchema,
} from "@kdx/shared";

import { sendEmail } from "../../../internal/email/email";
import TeamInvite from "../../../internal/email/templates/team-invite";
import { createTRPCRouter, protectedProcedure } from "../../../trpc";

export const invitationRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const invitations = await ctx.prisma.invitation.findMany({
      where: {
        teamId: ctx.session.user.activeTeamId,
      },
    });

    return invitations.map((invite) => ({
      inviteId: invite.id,
      inviteEmail: invite.email,
    }));
  }),
  invite: protectedProcedure
    .input(inviteUserSchema)
    .mutation(async ({ ctx, input }) => {
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
    }),
  accept: protectedProcedure
    .input(
      z.object({
        invitationId: z.string().cuid(),
      }),
    )
    //.use(enforceUserHasTeam) // TODO: make this a middleware
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.email)
        throw new TRPCError({
          message: "Not implemented",
          code: "NOT_IMPLEMENTED",
        }); //TODO: WTF do I do about non existing emails? ??

      const invitation = await ctx.prisma.invitation.findUnique({
        where: {
          id: input.invitationId,
          email: ctx.session.user.email,
        },
        select: {
          Team: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!invitation)
        throw new TRPCError({
          message: "No Invitation Found",
          code: "NOT_FOUND",
        });

      await ctx.prisma.$transaction([
        ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            Teams: {
              connect: {
                id: invitation.Team.id,
              },
            },
            activeTeamId: invitation.Team.id,
          },
        }),
        ctx.prisma.invitation.delete({
          where: {
            id: input.invitationId,
          },
        }),
      ]);
    }),

  delete: protectedProcedure
    .input(
      z.object({
        invitationId: z.string().cuid(),
      }),
    )
    //.use(enforceUserHasTeam) // TODO: make this a middleware
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.invitation.findUnique({
        where: {
          id: input.invitationId,
          Team: {
            id: ctx.session.user.activeTeamId,
          },
        },
      });

      if (!invitation)
        throw new TRPCError({
          message: "No Invitation Found",
          code: "NOT_FOUND",
        });

      return await ctx.prisma.invitation.delete({
        where: {
          id: input.invitationId,
        },
      });
    }),
});
