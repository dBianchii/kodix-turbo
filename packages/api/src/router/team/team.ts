import { revalidatePath, revalidateTag } from "next/cache";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { kodixCareAdminRoleId, prisma } from "@kdx/db";
import { updateTeamSchema } from "@kdx/shared";

import {
  createTRPCRouter,
  protectedProcedure,
  userAndWsLimitedProcedure,
} from "../../trpc";
import { invitationRouter } from "./invitation/invitation";

export const teamRouter = createTRPCRouter({
  getAllForLoggedUser: protectedProcedure.query(async ({ ctx }) => {
    const teams = await ctx.prisma.team.findMany({
      where: {
        users: {
          some: {
            id: ctx.session.user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        ownerId: true,
      },
    });

    return teams;
  }),
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        teamName: z.string().min(3).max(32, {
          message: "Team name must be at most 32 characters",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //! When changing team creation flow here, change it on @kdx/auth new user creation as well!
      const ws = await ctx.prisma.team.create({
        data: {
          ownerId: input.userId,
          name: input.teamName,
          users: input.userId
            ? {
                connect: [{ id: input.userId }],
              }
            : undefined,
        },
      });
      revalidateTag("getAllForLoggedUser");
      return ws;
    }),
  getOne: protectedProcedure
    .input(z.object({ teamId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const team = await ctx.prisma.team.findUnique({
        where: {
          id: input.teamId,
        },
      });

      if (!team)
        throw new TRPCError({
          message: "No Team Found",
          code: "NOT_FOUND",
        });

      return team;
    }),
  update: userAndWsLimitedProcedure
    .input(updateTeamSchema)
    .mutation(async ({ ctx, input }) => {
      const ws = await ctx.prisma.team.update({
        where: {
          id: input.teamId,
        },
        data: {
          name: input.teamName,
        },
      });
      revalidateTag("getAllForLoggedUser");
      return ws;
    }),
  getActiveTeam: protectedProcedure.query(async ({ ctx }) => {
    const team = await ctx.prisma.team.findUniqueOrThrow({
      where: {
        id: ctx.session.user.activeTeamId,
      },
      include: {
        users: true,
      },
    });

    return team;
  }),
  installApp: protectedProcedure
    .input(
      z.object({
        appId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //ao instalar o Kodix Care,
      //Colocar o usuario como admin

      const app = await ctx.prisma.app.findUnique({
        where: {
          id: input.appId,
        },
      });
      if (!app)
        throw new TRPCError({
          message: "No App Found",
          code: "NOT_FOUND",
        });

      const team = await ctx.prisma.team.findUnique({
        where: {
          id: ctx.session.user.activeTeamId,
        },
      });
      if (!team)
        throw new TRPCError({
          message: "No Team Found",
          code: "NOT_FOUND",
        });

      if (team.ownerId !== ctx.session.user.id)
        throw new TRPCError({
          message: "Only the team owner can install apps",
          code: "FORBIDDEN",
        });

      const transactionResult = await ctx.prisma.$transaction([
        ctx.prisma.app.update({
          where: {
            id: input.appId,
          },
          data: {
            activeTeams: {
              connect: {
                id: team.id,
              },
            },
          },
        }),
        ctx.prisma.userAppRole.create({
          data: {
            app: {
              connect: {
                id: input.appId,
              },
            },
            user: {
              connect: {
                id: ctx.session.user.id,
              },
            },
            team: {
              connect: {
                id: ctx.session.user.activeTeamId,
              },
            },
            appRole: {
              connect: {
                id: kodixCareAdminRoleId,
              },
            },
          },
        }),
      ]);
      const [appUpdated] = transactionResult;

      revalidateTag("getAllForLoggedUser");
      revalidatePath(`/apps${app.url}`);

      return appUpdated;
    }),
  uninstallApp: protectedProcedure
    .input(
      z.object({
        appId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const uninstalledApp = await ctx.prisma.team.update({
        where: {
          id: ctx.session.user.activeTeamId,
        },
        data: {
          activeApps: {
            disconnect: {
              id: input.appId,
            },
          },
        },
      });
      revalidateTag("getAllForLoggedUser");

      return uninstalledApp;
    }),
  invitation: invitationRouter,
  removeUser: protectedProcedure
    .input(
      z.object({
        teamId: z.string().cuid(),
        userId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isUserTryingToRemoveSelfFromWs =
        input.userId === ctx.session.user.id;

      const team = await ctx.prisma.team.findFirstOrThrow({
        where: {
          id: input.teamId,
        },
        select: {
          ownerId: true,
          users: {
            select: {
              id: true,
            },
          },
        },
      });

      if (isUserTryingToRemoveSelfFromWs) {
        if (team?.ownerId === ctx.session.user.id) {
          throw new TRPCError({
            message:
              "You are the owner of this team. You must transfer ownership first before leaving it",
            code: "BAD_REQUEST",
          });
        }
      }

      if (team?.users.length <= 1)
        throw new TRPCError({
          message:
            "This user cannot leave since they are the only remaining owner of the team. Delete this team instead",
          code: "BAD_REQUEST",
        });

      //TODO: Implemente role based access control
      const otherTeam = await ctx.prisma.team.findFirst({
        where: {
          id: {
            not: input.teamId,
          },
          users: {
            some: {
              id: input.userId,
            },
          },
        },
      });

      if (!otherTeam)
        throw new TRPCError({
          message:
            "The user needs to have at least one team. Please create another team before removing this user",
          code: "BAD_REQUEST",
        });

      //check if there are more people in the team before removal

      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          teams: {
            disconnect: {
              id: input.teamId,
            },
          },
          activeTeamId: otherTeam.id,
        },
      });
    }),
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.user.findMany({
      where: {
        teams: {
          some: {
            id: ctx.session.user.activeTeamId,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });
  }),
});
