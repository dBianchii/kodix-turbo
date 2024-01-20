import { revalidateTag } from "next/cache";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  appIdToAdminIdMap,
  calendarAppId,
  kodixCareAppId,
  todoAppId,
} from "@kdx/shared";
import { updateTeamSchema } from "@kdx/validators";

import {
  createTRPCRouter,
  protectedProcedure,
  userAndTeamLimitedProcedure,
} from "../../trpc";
import { invitationRouter } from "./invitation/invitation";

export const teamRouter = createTRPCRouter({
  getAllForLoggedUser: protectedProcedure.query(async ({ ctx }) => {
    const teams = await ctx.prisma.team.findMany({
      where: {
        Users: {
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
      const team = await ctx.prisma.team.create({
        data: {
          ownerId: input.userId,
          name: input.teamName,
          Users: input.userId
            ? {
                connect: [{ id: input.userId }],
              }
            : undefined,
        },
      });
      revalidateTag("getAllForLoggedUser");
      return team;
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
  update: userAndTeamLimitedProcedure
    .input(updateTeamSchema)
    .mutation(async ({ ctx, input }) => {
      const team = await ctx.prisma.team.update({
        where: {
          id: input.teamId,
        },
        data: {
          name: input.teamName,
        },
      });
      revalidateTag("getAllForLoggedUser");
      return team;
    }),
  getActiveTeam: protectedProcedure.query(async ({ ctx }) => {
    const team = await ctx.prisma.team.findUniqueOrThrow({
      where: {
        id: ctx.session.user.activeTeamId,
      },
      include: {
        Users: true,
      },
    });

    return team;
  }),
  installApp: protectedProcedure
    .input(
      z.object({
        appId: z.union([
          z.literal(todoAppId),
          z.literal(calendarAppId),
          z.literal(kodixCareAppId),
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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

      const appUpdated = await ctx.prisma.$transaction(async (tx) => {
        const updatedApp = await tx.app.update({
          where: {
            id: input.appId,
          },
          data: {
            Teams: {
              connect: {
                id: team.id,
              },
            },
          },
        });
        await tx.userAppRole.create({
          data: {
            App: {
              connect: {
                id: input.appId,
              },
            },
            User: {
              connect: {
                id: ctx.session.user.id,
              },
            },
            Team: {
              connect: {
                id: ctx.session.user.activeTeamId,
              },
            },
            AppRole: {
              connect: {
                id: appIdToAdminIdMap[input.appId],
              },
            },
          },
        });

        return updatedApp;
      });

      revalidateTag("getAllForLoggedUser");

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
          ActiveApps: {
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
      const isUserTryingToRemoveSelfFromTeam =
        input.userId === ctx.session.user.id;

      const team = await ctx.prisma.team.findFirstOrThrow({
        where: {
          id: input.teamId,
        },
        select: {
          ownerId: true,
          Users: {
            select: {
              id: true,
            },
          },
        },
      });

      if (isUserTryingToRemoveSelfFromTeam) {
        if (team?.ownerId === ctx.session.user.id) {
          throw new TRPCError({
            message:
              "You are the owner of this team. You must transfer ownership first before leaving it",
            code: "BAD_REQUEST",
          });
        }
      }

      if (team?.Users.length <= 1)
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
          Users: {
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
          Teams: {
            disconnect: {
              id: input.teamId,
            },
          },
          activeTeamId: otherTeam.id,
        },
      });
    }),
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findMany({
      where: {
        Teams: {
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
