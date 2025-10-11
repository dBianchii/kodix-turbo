import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { protectedProcedure } from "../../../procedures";
import { listSalesHandler } from "./listSales.handler";

const ZListSalesInputSchema = z.object({
  campoOrdenadoAscendente: z.enum(["NUMERO", "CLIENTE", "DATA"]).optional(),
  campoOrdenadoDescendente: z.enum(["NUMERO", "CLIENTE", "DATA"]).optional(),
  dataCriacaoAte: z.string().optional(),
  dataCriacaoDe: z.string().optional(),
  dataFim: z.string().optional(),
  dataInicio: z.string().optional(),
  idsCategorias: z.array(z.string()).optional(),
  idsClientes: z.array(z.string()).optional(),
  idsLegadoCategorias: z.array(z.string()).optional(),
  idsLegadoClientes: z.array(z.string()).optional(),
  idsLegadoDonos: z.array(z.string()).optional(),
  idsLegadoProdutos: z.array(z.string()).optional(),
  idsNaturezaOperacao: z.array(z.string()).optional(),
  idsProdutos: z.array(z.string()).optional(),
  idsVendedores: z.array(z.string()).optional(),
  numeros: z.array(z.string()).optional(),
  origens: z.array(z.string()).optional(),
  pagina: z.number().optional(),
  pendente: z.boolean().optional(),
  situacoes: z.array(z.string()).optional(),
  tamanhoPagina: z.number().optional(),
  termoBusca: z.string().optional(),
  tipos: z.array(z.string()).optional(),
  totais: z.string().optional(),
});

export const salesRouter = {
  list: protectedProcedure.input(ZListSalesInputSchema).query(listSalesHandler),
} satisfies TRPCRouterRecord;
