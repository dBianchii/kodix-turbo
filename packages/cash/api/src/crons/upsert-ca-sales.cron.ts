import { caRepository } from "@cash/db/repositories";
import dayjs from "@kodix/dayjs";

import { listSales } from "../services/conta-azul.service";

export async function upsertCaSalesCron(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const today = dayjs().format("YYYY-MM-DD");

  const { itens } = await listSales({
    dataFim: today,
    dataInicio: yesterday,
  });

  if (!itens?.length) {
    return new Response("No recent sales found - skipping", {
      status: 304,
    });
  }

  await caRepository.upsertCASales(
    itens.map((sale) => ({
      caId: sale.id,
      clienteEmail: sale.cliente?.email,
      clienteId: sale.cliente?.id,
      clienteNome: sale.cliente.nome,
      criadoEm: new Date(sale.criado_em),
      numero: sale.numero,
      total: sale.total,
    }))
  );

  return new Response("Hello from Vercel!");
}
