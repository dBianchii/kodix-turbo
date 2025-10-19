import { caRepository } from "@cash/db/repositories";
import { TRPCError } from "@trpc/server";

import type { TPublicProcedureContext } from "../../procedures";
import type { TRegisterInterestInputSchema } from "../../schemas/client";
import {
  type CreateContaAzulPersonParams,
  createContaAzulPerson,
  listContaAzulPersons,
  updateContaAzulPerson,
} from "../../../services/conta-azul.service";

interface RegisterInterestHandlerInput {
  ctx: TPublicProcedureContext;
  input: TRegisterInterestInputSchema;
}

export async function registerInterestHandler({
  input,
}: RegisterInterestHandlerInput) {
  // Remove +55 country code from phone (ContaAzul expects DDXXXXXXXXX format)
  const phoneWithoutCountryCode = input.phone.replace(/^\+55/, "");
  let caId: string;

  const newAddress: NonNullable<
    CreateContaAzulPersonParams["enderecos"]
  >[number] = {
    bairro: input.bairro,
    cep: input.cep,
    cidade: input.cidade,
    complemento: input.complemento,
    estado: input.estado,
    logradouro: input.logradouro,
    numero: input.numero,
    pais: "Brasil",
  };
  const payload: CreateContaAzulPersonParams = {
    cpf: input.cpf,
    email: input.email,
    enderecos: [newAddress],
    nome: input.name,
    observacao: "Cadastro KCash",
    perfis: [
      {
        tipo_perfil: "Cliente",
      },
    ],
    telefone_celular: phoneWithoutCountryCode,
    tipo_pessoa: "Física",
  };

  try {
    const { items } = await listContaAzulPersons({
      busca: input.cpf,
      pagina: 1,
      tamanho_pagina: 10,
    });
    const existingPerson = items[0];
    if (existingPerson) {
      const address = existingPerson.endereco ? [existingPerson.endereco] : [];

      await updateContaAzulPerson({
        ...payload,
        enderecos: address
          .filter((a) => a.cep !== input.cep)
          .concat([newAddress]),
        id: existingPerson.id,
      });
      caId = existingPerson.id;
    } else {
      const { id } = await createContaAzulPerson(payload);
      caId = id;
    }
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
  await caRepository.upsertClientsByCaId([
    {
      caId,
      document: input.cpf,
      email: input.email,
      interestRegisteredAt: new Date().toISOString(),
      name: input.name,
      phone: input.phone,
      type: "Física",
    },
  ]);
}
