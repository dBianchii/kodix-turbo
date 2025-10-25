import { caRepository } from "@cash/db/repositories";

import type { TPublicProcedureContext } from "../../procedures";
import type { TGetByCpfInputSchema } from "../../schemas/client";

interface GetByCpfHandlerInput {
  ctx: TPublicProcedureContext;
  input: TGetByCpfInputSchema;
}

export async function getByCpfHandler({ input }: GetByCpfHandlerInput) {
  const client = await caRepository.findClientByCpf(input.cpf);
  if (!client) return null;
  return {
    email: (client?.email?.length ?? 0) > 0,
    phone: (client?.phone?.length ?? 0) > 0,
  };
}
