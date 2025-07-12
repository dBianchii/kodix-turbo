import { TRPCError } from "@trpc/server";

import {
  ZCreateInputSchema,
  ZUpdateInputSchema,
} from "@kdx/validators/trpc/app/todo";

import { protectedProcedure } from "../../../procedures";
import { t } from "../../../trpc";
import { createHandler } from "./create.handler";
import { getAllHandler } from "./getAll.handler";
import { updateHandler } from "./update.handler";

const disabledTodo = () => {
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "You are not allowed to create todos",
  });
};

export const todoRouter = t.router({
  create: protectedProcedure
    .use(disabledTodo)
    .input(ZCreateInputSchema)
    .mutation(createHandler),
  getAll: protectedProcedure.use(disabledTodo).query(getAllHandler),
  update: protectedProcedure
    .use(disabledTodo)
    .input(ZUpdateInputSchema)
    .mutation(updateHandler),
});
