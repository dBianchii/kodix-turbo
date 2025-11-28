import type { TRPCRouterRecord } from "@trpc/server";

import { publicProcedure } from "../../procedures";
import { ZGetByCpfInputSchema, ZRegisterInputSchema } from "../../schemas/client";
import { getByCpfHandler } from "./getByCpf.handler";
import { registerHandler } from "./register.handler";

export const clientRouter = {
  getByCpf: publicProcedure.input(ZGetByCpfInputSchema).query(getByCpfHandler),
  register: publicProcedure
    .input(ZRegisterInputSchema)
    .mutation(registerHandler),
} satisfies TRPCRouterRecord;
