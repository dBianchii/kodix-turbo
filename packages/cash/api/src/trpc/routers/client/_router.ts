import type { TRPCRouterRecord } from "@trpc/server";

import { protectedProcedure, publicProcedure } from "../../procedures";
import {
  ZGetByCpfInputSchema,
  ZGetClientByIdInputSchema,
  ZListClientsInputSchema,
  ZRegisterInputSchema,
} from "../../schemas/client";
import { getByCpfHandler } from "./getByCpf.handler";
import { getByIdHandler } from "./getById.handler";
import { listClientsHandler } from "./listClients.handler";
import { registerHandler } from "./register.handler";

export const clientRouter = {
  getByCpf: publicProcedure.input(ZGetByCpfInputSchema).query(getByCpfHandler),
  getById: protectedProcedure
    .input(ZGetClientByIdInputSchema)
    .query(getByIdHandler),
  list: protectedProcedure
    .input(ZListClientsInputSchema)
    .query(listClientsHandler),
  register: publicProcedure
    .input(ZRegisterInputSchema)
    .mutation(registerHandler),
} satisfies TRPCRouterRecord;
