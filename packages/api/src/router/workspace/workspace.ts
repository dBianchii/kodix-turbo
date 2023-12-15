import { revalidatePath, revalidateTag } from "next/cache";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { kodixCareAdminRoleId, prisma } from "@kdx/db";

import { updateWorkspaceSchema } from "../../shared";
import {
  createTRPCRouter,
  protectedProcedure,
  userAndWsLimitedProcedure,
} from "../../trpc";
import { invitationRouter } from "./invitation/invitation";

export const workspaceRouter = createTRPCRouter({
  getAllForLoggedUser: protectedProcedure.query(async ({ ctx }) => {
    const workspaces = await ctx.prisma.workspace.findMany({
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

    return workspaces;
  }),
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        workspaceName: z.string().min(3).max(32, {
          message: "Workspace name must be at most 32 characters",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //! When changing workspace creation flow here, change it on @kdx/auth new user creation as well!
      const ws = await ctx.prisma.workspace.create({
        data: {
          ownerId: input.userId,
          name: input.workspaceName,
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
    .input(z.object({ workspaceId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: {
          id: input.workspaceId,
        },
      });

      if (!workspace)
        throw new TRPCError({
          message: "No Workspace Found",
          code: "NOT_FOUND",
        });

      return workspace;
    }),
  update: userAndWsLimitedProcedure
    .input(updateWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const ws = await ctx.prisma.workspace.update({
        where: {
          id: input.workspaceId,
        },
        data: {
          name: input.workspaceName,
        },
      });
      revalidateTag("getAllForLoggedUser");
      return ws;
    }),
  getActiveWorkspace: protectedProcedure.query(async ({ ctx }) => {
    const workspace = await ctx.prisma.workspace.findUniqueOrThrow({
      where: {
        id: ctx.session.user.activeWorkspaceId,
      },
      include: {
        users: true,
      },
    });

    return workspace;
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

      const workspace = await ctx.prisma.workspace.findUnique({
        where: {
          id: ctx.session.user.activeWorkspaceId,
        },
      });
      if (!workspace)
        throw new TRPCError({
          message: "No Workspace Found",
          code: "NOT_FOUND",
        });

      if (workspace.ownerId !== ctx.session.user.id)
        throw new TRPCError({
          message: "Only the workspace owner can install apps",
          code: "FORBIDDEN",
        });

      const transactionResult = await ctx.prisma.$transaction([
        ctx.prisma.app.update({
          where: {
            id: input.appId,
          },
          data: {
            activeWorkspaces: {
              connect: {
                id: workspace.id,
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
            workspace: {
              connect: {
                id: ctx.session.user.activeWorkspaceId,
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
      const uninstalledApp = await ctx.prisma.workspace.update({
        where: {
          id: ctx.session.user.activeWorkspaceId,
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
        workspaceId: z.string().cuid(),
        userId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isUserTryingToRemoveSelfFromWs =
        input.userId === ctx.session.user.id;

      const workspace = await ctx.prisma.workspace.findFirstOrThrow({
        where: {
          id: input.workspaceId,
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
        if (workspace?.ownerId === ctx.session.user.id) {
          throw new TRPCError({
            message:
              "You are the owner of this workspace. You must transfer ownership first before leaving it",
            code: "BAD_REQUEST",
          });
        }
      }

      if (workspace?.users.length <= 1)
        throw new TRPCError({
          message:
            "This user cannot leave since they are the only remaining owner of the workspace. Delete this workspace instead",
          code: "BAD_REQUEST",
        });

      //TODO: Implemente role based access control
      const otherWorkspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: {
            not: input.workspaceId,
          },
          users: {
            some: {
              id: input.userId,
            },
          },
        },
      });

      if (!otherWorkspace)
        throw new TRPCError({
          message:
            "The user needs to have at least one workspace. Please create another workspace before removing this user",
          code: "BAD_REQUEST",
        });

      //check if there are more people in the workspace before removal

      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          workspaces: {
            disconnect: {
              id: input.workspaceId,
            },
          },
          activeWorkspaceId: otherWorkspace.id,
        },
      });
    }),
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.user.findMany({
      where: {
        workspaces: {
          some: {
            id: ctx.session.user.activeWorkspaceId,
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
