import { caRepository } from "@cash/db/repositories";

import type { TPublicProcedureContext } from "../../procedures";
import type {
  RegisterInputSchemaKeys,
  TGetByCpfInputSchema,
} from "../../schemas/client";
import { listContaAzulPersons } from "../../../services/conta-azul.service";

interface GetByCpfHandlerInput {
  ctx: TPublicProcedureContext;
  input: TGetByCpfInputSchema;
}

type MissingOrDifferentFields = Extract<
  RegisterInputSchemaKeys,
  "name" | "email" | "phone"
>;

export async function getByCpfHandler({ input }: GetByCpfHandlerInput) {
  const [caResponse, dbClient] = await Promise.all([
    listContaAzulPersons({
      busca: input.cpf,
      com_endereco: true,
      pagina: 1,
      tamanho_pagina: 10,
    }),
    caRepository.findClientByCpf(input.cpf),
  ]);

  const caPerson = caResponse.items?.find((p) => p.documento === input.cpf);
  if (!caPerson)
    return {
      status: "not-found",
    } as const;

  const missingOrDifferentFields: MissingOrDifferentFields[] = [];

  const addToMissingOrDifferentFields = (
    dbKey: MissingOrDifferentFields,
    caValue: string | null | undefined,
  ) => {
    if (dbClient?.[dbKey] !== caValue) {
      missingOrDifferentFields.push(dbKey);
    }
  };

  addToMissingOrDifferentFields("name", caPerson.nome);
  addToMissingOrDifferentFields("email", caPerson.email?.toLowerCase());
  //TODO: A Conta Azul não retorna o telefone celular, por isso não é possível verificar se ele é diferente pelo lado deles.
  if (!dbClient?.phone) {
    missingOrDifferentFields.push("phone");
  }

  return {
    missingOrDifferentFields,
    status:
      missingOrDifferentFields.length > 0 ? "missing-fields" : "completed",
  } as const;
}
