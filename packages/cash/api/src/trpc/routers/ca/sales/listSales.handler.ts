import z from "zod";

import type { TProtectedProcedureContext } from "../../../procedures";
import { listSales } from "../../../../services/conta-azul.service";

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

interface ListSalesOptions {
  ctx: TProtectedProcedureContext;
  input: z.infer<typeof ZListSalesInputSchema>;
}

export const listSalesHandler = ({ input }: ListSalesOptions) => {
  return listSales(input);
};
