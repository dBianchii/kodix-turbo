import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Status } from "@kdx/db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const todoRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        reminder: z.boolean().optional(),
        priority: z.number().optional(),
        status: z.nativeEnum(Status).optional(),
        assignedToUserId: z.string().cuid().optional().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.prisma.todo.create({
        data: {
          assignedToUserId: input.assignedToUserId,
          teamId: ctx.session.user.activeTeamId,

          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
          priority: input.priority,
          status: input.status,
        },
      });

      return todo.id;
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const todos = await ctx.prisma.todo.findMany({
      where: {
        teamId: ctx.session.user.activeTeamId,
      },
      include: {
        AssignedToUser: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!todos)
      throw new TRPCError({
        message: "No Todos Found",
        code: "NOT_FOUND",
      });

    return todos;
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.date().optional().nullish(),
        reminder: z.boolean().optional(),
        priority: z.number().optional(),
        status: z.nativeEnum(Status).optional(),
        assignedToUserId: z.string().cuid().optional().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.prisma.todo.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          assignedToUserId: input.assignedToUserId,
          description: input.description,
          dueDate: input.dueDate,
          priority: input.priority,
          status: input.status,
        },
      });

      return todo;
    }),
});
