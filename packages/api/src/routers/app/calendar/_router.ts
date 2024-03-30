import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZCancelInputSchema,
  ZCreateInputSchema,
  ZEditInputSchema,
  ZGetAllInputSchema,
} from "@kdx/validators/trpc/app/calendar";

import { protectedProcedure } from "../../../trpc";
import { cancelHandler } from "./cancel.handler";
import { createHandler } from "./create.handler";
import { editHandler } from "./edit.handler";
import { getAllHandler } from "./getAll.handler";
import { nukeHandler } from "./nuke.handler";

export const calendarRouter = {
  cancel: protectedProcedure
    .input(ZCancelInputSchema)
    .mutation(async (opts) => await cancelHandler(opts)),
  create: protectedProcedure
    .input(ZCreateInputSchema)
    .mutation(async (opts) => await createHandler(opts)),
  edit: protectedProcedure
    .input(ZEditInputSchema)
    .mutation(async (opts) => await editHandler(opts)),
  getAll: protectedProcedure
    .input(ZGetAllInputSchema)
    .query(async (opts) => await getAllHandler(opts)),
  nuke: protectedProcedure.mutation(async (opts) => await nukeHandler(opts)),
} satisfies TRPCRouterRecord;
