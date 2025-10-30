import { caRepository } from "@cash/db/repositories";
import { TRPCError } from "@trpc/server";

import type { TPublicProcedureContext } from "../../procedures";
import type { TAddMissingFieldsInputSchema } from "../../schemas/client";
import {
  listContaAzulPersons,
  updateContaAzulPerson,
} from "../../../services/conta-azul.service";
import { BRAZIL_PHONE_COUNTRY_CODE_REGEX } from "./register.handler";

interface AddMissingFieldsHandlerInput {
  ctx: TPublicProcedureContext;
  input: TAddMissingFieldsInputSchema;
}

export async function addMissingFieldsHandler({
  input,
}: AddMissingFieldsHandlerInput) {
  const phoneWithoutCountryCode = input.phone?.replace(
    BRAZIL_PHONE_COUNTRY_CODE_REGEX,
    "",
  );

  try {
    const { items } = await listContaAzulPersons({
      busca: input.cpf,
      pagina: 1,
      tamanho_pagina: 10,
    });
    const existingPerson = items[0];

    if (!existingPerson) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cliente não encontrado",
      });
    }

    const hasAddressFields =
      input.cep ||
      input.logradouro ||
      input.numero ||
      input.bairro ||
      input.cidade ||
      input.estado;

    const existingAddresses = existingPerson.endereco
      ? [existingPerson.endereco]
      : [];
    const newAddress = hasAddressFields
      ? {
          bairro: input.bairro,
          cep: input.cep,
          cidade: input.cidade,
          complemento: input.complemento,
          estado: input.estado,
          logradouro: input.logradouro,
          numero: input.numero,
          pais: "Brasil",
        }
      : undefined;

    await updateContaAzulPerson({
      email: input.email,
      enderecos: newAddress
        ? existingAddresses
            .filter((a) => a.cep !== newAddress.cep)
            .concat([newAddress])
        : undefined,
      id: existingPerson.id,
      nome: input.name,
      telefone_celular: phoneWithoutCountryCode,
    });

    // Atualiza DB local
    await caRepository.upsertClientsByCaId([
      {
        bairro: newAddress?.bairro,
        caId: existingPerson.id,
        cep: newAddress?.cep,
        cidade: newAddress?.cidade,
        complemento: newAddress?.complemento,
        document: input.cpf,
        email: input.email,
        estado: newAddress?.estado,
        logradouro: newAddress?.logradouro,
        name: input.name ?? existingPerson.nome,
        numero: newAddress?.numero,
        pais: newAddress?.pais,
        phone: input.phone,
        registeredFromFormAt: new Date().toISOString(),
        type: existingPerson.tipo_pessoa,
      },
    ]);
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
