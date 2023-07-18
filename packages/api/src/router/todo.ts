import { Status } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
          workspaceId: ctx.session.user.activeWorkspaceId,

          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
          priority: input.priority,
          status: input.status,
        },
      });

      return todo.id;
    }),
  getAllForLoggedUser: protectedProcedure.query(async ({ ctx }) => {
    const todos = await ctx.prisma.todo.findMany({
      where: {
        workspaceId: ctx.session.user.activeWorkspaceId,
      },
      include: {
        assignedToUser: {
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
