import type { TRPCRouterRecord } from "@trpc/server";

import { adminProcedure } from "../../../procedures";
import {
  ZGetClientByIdInputSchema,
  ZListClientsInputSchema,
} from "../../../schemas/client";
import { listClientsHandler } from "../../client/listClients.handler";
import { getByIdHandler } from "./getById.handler";

export const clientRouter = {
  getById: adminProcedure
    .input(ZGetClientByIdInputSchema)
    .query(getByIdHandler),
  list: adminProcedure.input(ZListClientsInputSchema).query(listClientsHandler),
} satisfies TRPCRouterRecord;
