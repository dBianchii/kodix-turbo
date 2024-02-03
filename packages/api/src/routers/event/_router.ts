import {
  ZCancelInput,
  ZCreateInput,
  ZEditInput,
  ZGetAllInput,
} from "@kdx/validators/trpc/event";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { cancelHandler } from "./cancel.handler";
import { createHandler } from "./create.handler";
import { editHandler } from "./edit.handler";
import { getAllHandler } from "./getAll.handler";
import { nukeHandler } from "./nuke.handler";

export const eventRouter = createTRPCRouter({
  cancel: protectedProcedure
    .input(ZCancelInput)
    .mutation(async (opts) => await cancelHandler(opts)),
  create: protectedProcedure
    .input(ZCreateInput)
    .mutation(async (opts) => await createHandler(opts)),
  edit: protectedProcedure
    .input(ZEditInput)
    .mutation(async (opts) => await editHandler(opts)),
  getAll: protectedProcedure
    .input(ZGetAllInput)
    .query(async (opts) => await getAllHandler(opts)),
  nuke: protectedProcedure.mutation(async (opts) => await nukeHandler(opts)),
});
