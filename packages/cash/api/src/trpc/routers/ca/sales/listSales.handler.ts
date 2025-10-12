import type z from "zod";

import type { TProtectedProcedureContext } from "../../../procedures";
import type { ZListSalesInputSchema } from "./_router";
import { listContaAzulSales } from "../../../../services/conta-azul.service";

interface ListSalesOptions {
  ctx: TProtectedProcedureContext;
  input: z.infer<typeof ZListSalesInputSchema>;
}

export const listSalesHandler = ({ input }: ListSalesOptions) => {
  return listContaAzulSales(input);
};
