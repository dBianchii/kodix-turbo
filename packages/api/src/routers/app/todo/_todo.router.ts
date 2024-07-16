import {
  ZCreateInputSchema,
  ZUpdateInputSchema,
} from "@kdx/validators/trpc/app/todo";

import { protectedProcedure } from "../../../procedures";
import { createTRPCRouter } from "../../../trpc";
import { createHandler } from "./create.handler";
import { getAllHandler } from "./getAll.handler";
import { updateHandler } from "./update.handler";

export const todoRouter = createTRPCRouter({
  create: protectedProcedure.input(ZCreateInputSchema).mutation(createHandler),
  getAll: protectedProcedure.query(getAllHandler),
  update: protectedProcedure.input(ZUpdateInputSchema).mutation(updateHandler),
});
