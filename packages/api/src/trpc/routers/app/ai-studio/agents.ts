import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { aiStudioRepository } from "@kdx/db/repositories";
import {
  createAiAgentSchema,
  findAiAgentsSchema,
  updateAiAgentSchema,
} from "@kdx/validators/trpc/app";

import { protectedProcedure } from "../../../procedures";

// Simple ID schema
const idSchema = z.object({
  id: z.string(),
});

export const aiAgentsRouter = {
  createAiAgent: protectedProcedure
    .input(createAiAgentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const agent = await aiStudioRepository.AiAgentRepository.create({
          ...input,
          teamId: ctx.auth.user.activeTeamId,
          createdById: ctx.auth.user.id,
        });
        return agent;
      } catch (error) {
        console.error("Error creating AI agent:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create AI agent",
          cause: error,
        });
      }
    }),

  findAiAgents: protectedProcedure
    .input(findAiAgentsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { limite, offset } = input;

        const [agents, total] = await Promise.all([
          aiStudioRepository.AiAgentRepository.findByTeam({
            teamId: ctx.auth.user.activeTeamId,
            limite,
            offset,
          }),
          aiStudioRepository.AiAgentRepository.countByTeam(
            ctx.auth.user.activeTeamId,
          ),
        ]);

        return {
          agents,
          pagination: {
            total,
            limit: limite,
            totalPages: Math.ceil(total / limite),
          },
        };
      } catch (error) {
        console.error("Error finding AI agents:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch AI agents",
          cause: error,
        });
      }
    }),

  findAiAgentById: protectedProcedure
    .input(idSchema)
    .query(async ({ input, ctx }) => {
      try {
        const agent = await aiStudioRepository.AiAgentRepository.findById(
          input.id,
        );
        if (!agent || agent.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "AI agent not found",
          });
        }
        return agent;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error finding AI agent:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch AI agent",
          cause: error,
        });
      }
    }),

  updateAiAgent: protectedProcedure
    .input(updateAiAgentSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      try {
        const agent = await aiStudioRepository.AiAgentRepository.findById(id);
        if (!agent || agent.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "AI agent not found",
          });
        }

        const updatedAgent = await aiStudioRepository.AiAgentRepository.update(
          id,
          data,
        );
        return updatedAgent;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating AI agent:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update AI agent",
          cause: error,
        });
      }
    }),

  deleteAiAgent: protectedProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const agent = await aiStudioRepository.AiAgentRepository.findById(
          input.id,
        );
        if (!agent || agent.teamId !== ctx.auth.user.activeTeamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "AI agent not found",
          });
        }

        await aiStudioRepository.AiAgentRepository.delete(input.id);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting AI agent:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete AI agent",
          cause: error,
        });
      }
    }),
} satisfies TRPCRouterRecord;
