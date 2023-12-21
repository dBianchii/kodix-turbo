import { revalidateTag } from "next/cache";
import { TRPCError } from "@trpc/server";
import { string, z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findMany();
    if (!user)
      throw new TRPCError({
        message: "No User Found",
        code: "INTERNAL_SERVER_ERROR",
      });

    return user;
  }),
  getOne: protectedProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
      });
      if (!user)
        throw new TRPCError({
          message: "No User Found",
          code: "INTERNAL_SERVER_ERROR",
        });

      return user;
    }),
  switchActiveTeam: protectedProcedure
    .input(z.object({ teamId: string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      revalidateTag("activeTeam"); //THIS WORKS!!

      const user = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
          Teams: {
            some: {
              ActiveUsers: {
                some: {
                  id: ctx.session.user.id,
                },
              },
            },
          },
        },
        data: {
          activeTeamId: input.teamId,
        },
        select: {
          Teams: {
            where: {
              id: input.teamId,
            },
            select: {
              id: true,
            },
          },
        },
      });

      if (!user.Teams[0])
        throw new TRPCError({
          message: "No Team Found",
          code: "INTERNAL_SERVER_ERROR",
        });

      return user.Teams[0];
    }),
  installApp: protectedProcedure
    .input(z.object({ appId: string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.team.update({
        where: {
          id: ctx.session.user.activeTeamId,
        },
        data: {
          ActiveApps: {
            connect: {
              id: input.appId,
            },
          },
        },
      });
    }),
  changeName: protectedProcedure
    .input(z.object({ name: string().max(32) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
});
