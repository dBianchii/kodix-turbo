import { caRepository } from "@cash/db/repositories";

import type { TPublicProcedureContext } from "../../procedures";
import type {
  RegisterInputSchemaKeys,
  TGetByCpfInputSchema,
} from "../../schemas/client";
import { listContaAzulPersons } from "../../../services/conta-azul.service";
import { BRAZIL_PHONE_COUNTRY_CODE_REGEX } from "./register.handler";

interface GetByCpfHandlerInput {
  ctx: TPublicProcedureContext;
  input: TGetByCpfInputSchema;
}

export async function getByCpfHandler({ input }: GetByCpfHandlerInput) {
  const [caResponse, dbClient] = await Promise.all([
    listContaAzulPersons({
      busca: input.cpf,
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

  const missingOrDifferentFields: RegisterInputSchemaKeys[] = [];

  const addToMissingOrDifferentFields = (
    dbKey: RegisterInputSchemaKeys,
    caValue: string | null | undefined,
  ) => {
    if (dbClient?.[dbKey] !== caValue) {
      missingOrDifferentFields.push(dbKey);
    }
  };

  addToMissingOrDifferentFields("name", caPerson.nome);
  addToMissingOrDifferentFields("email", caPerson.email);
  addToMissingOrDifferentFields(
    "phone",
    caPerson.telefone?.replace(BRAZIL_PHONE_COUNTRY_CODE_REGEX, ""),
  );
  addToMissingOrDifferentFields("cep", caPerson.endereco?.cep);
  addToMissingOrDifferentFields("logradouro", caPerson.endereco?.logradouro);
  addToMissingOrDifferentFields("numero", caPerson.endereco?.numero);
  addToMissingOrDifferentFields("complemento", caPerson.endereco?.complemento);
  addToMissingOrDifferentFields("bairro", caPerson.endereco?.bairro);
  addToMissingOrDifferentFields("cidade", caPerson.endereco?.cidade);
  addToMissingOrDifferentFields("estado", caPerson.endereco?.estado);

  return {
    missingOrDifferentFields,
    status: "missing-fields",
  } as const;
}
