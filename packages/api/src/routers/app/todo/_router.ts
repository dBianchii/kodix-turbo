import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZCreateInputSchema,
  ZUpdateInputSchema,
} from "@kdx/validators/trpc/app/todo";

import { protectedProcedure } from "../../../trpc";
import { createHandler } from "./create.handler";
import { getAllHandler } from "./getAll.handler";
import { updateHandler } from "./update.handler";

export const todoRouter = {
  create: protectedProcedure
    .input(ZCreateInputSchema)
    .mutation(async (opts) => await createHandler(opts)),
  getAll: protectedProcedure.query(async (opts) => await getAllHandler(opts)),
  update: protectedProcedure
    .input(ZUpdateInputSchema)
    .mutation(async (opts) => await updateHandler(opts)),
} satisfies TRPCRouterRecord;
