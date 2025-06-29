import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { aiStudioRepository } from "@kdx/db/repositories";

import { protectedProcedure } from "../../../procedures";
import { t } from "../../../trpc";

export const aiLibrariesRouter = t.router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        files: z.any().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const library = await aiStudioRepository.AiLibraryRepository.create({
          ...input,
          teamId: ctx.auth.user.activeTeamId,
        });
        return library;
      } catch (error) {
        console.error("Error creating AI library:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create AI library",
          cause: error,
        });
      }
    }),

  find: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const { limit: limite, offset } = input;

        const [libraries, total] = await Promise.all([
          aiStudioRepository.AiLibraryRepository.findByTeam({
            teamId: ctx.auth.user.activeTeamId,
            limite,
            offset,
          }),
          aiStudioRepository.AiLibraryRepository.countByTeam(
            ctx.auth.user.activeTeamId,
          ),
        ]);

        return {
          libraries,
          pagination: {
            total,
            limit: limite,
            totalPages: Math.ceil(total / limite),
          },
        };
      } catch (error) {
        console.error("Error finding AI libraries:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch AI libraries",
          cause: error,
        });
      }
    }),

  findById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const library = await aiStudioRepository.AiLibraryRepository.findById(
          input.id,
        );
        if (!library || library.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "AI library not found",
          });
        }
        return library;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error finding AI library:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch AI library",
          cause: error,
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        files: z.any().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      try {
        const library =
          await aiStudioRepository.AiLibraryRepository.findById(id);
        if (!library || library.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "AI library not found",
          });
        }

        const updatedLibrary =
          await aiStudioRepository.AiLibraryRepository.update(id, data);
        return updatedLibrary;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating AI library:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update AI library",
          cause: error,
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const library = await aiStudioRepository.AiLibraryRepository.findById(
          input.id,
        );
        if (!library || library.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "AI library not found",
          });
        }

        await aiStudioRepository.AiLibraryRepository.delete(input.id);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting AI library:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete AI library",
          cause: error,
        });
      }
    }),
});
