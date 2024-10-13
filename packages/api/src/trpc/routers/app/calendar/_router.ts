import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZCancelInputSchema,
  ZCreateInputSchema,
  ZEditInputSchema,
  ZGetAllInputSchema,
} from "@kdx/validators/trpc/app/calendar";

import { protectedProcedure } from "../../../procedures";
import { cancelHandler } from "./cancel.handler";
import { createHandler } from "./create.handler";
import { editHandler } from "./edit.handler";
import { getAllHandler } from "./getAll.handler";
import { nukeHandler } from "./nuke.handler";

export const calendarRouter = {
  cancel: protectedProcedure.input(ZCancelInputSchema).mutation(cancelHandler),
  create: protectedProcedure.input(ZCreateInputSchema).mutation(createHandler),
  edit: protectedProcedure.input(ZEditInputSchema).mutation(editHandler),
  getAll: protectedProcedure.input(ZGetAllInputSchema).query(getAllHandler),
  nuke: protectedProcedure.mutation(nukeHandler),
} satisfies TRPCRouterRecord;
