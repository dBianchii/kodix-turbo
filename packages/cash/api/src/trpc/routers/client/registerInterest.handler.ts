import { db } from "@cash/db/client";
import { clients } from "@cash/db/schema";

import type { TPublicProcedureContext } from "../../procedures";
import type { RegisterInterestInput } from "../../schemas/client";
import { createContaAzulPerson } from "../../../services/conta-azul.service";

interface RegisterInterestHandlerInput {
  ctx: TPublicProcedureContext;
  input: RegisterInterestInput;
}

export async function registerInterestHandler({
  input,
}: RegisterInterestHandlerInput) {
  const caPerson = await createContaAzulPerson({
    cpf: input.cpf,
    email: `placeholder-${Date.now()}@example.com`,
    nome: input.name,
    perfis: [
      {
        tipo_perfil: "Cliente",
      },
    ],
    telefone_comercial: input.phone,
    tipo_pessoa: "Física",
  });

  await db.insert(clients).values({
    caId: caPerson.id,
    document: input.cpf,
    email: `placeholder-${Date.now()}@example.com`,
    name: input.name,
    phone: input.phone,
    type: "Física",
  });

  return {
    success: true,
  };
}
