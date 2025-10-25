import { caRepository } from "@cash/db/repositories";
import { TRPCError } from "@trpc/server";

import type { TPublicProcedureContext } from "../../procedures";
import type { TRegisterInputSchema } from "../../schemas/client";
import {
  type CreateContaAzulPersonParams,
  createContaAzulPerson,
  listContaAzulPersons,
  updateContaAzulPerson,
} from "../../../services/conta-azul.service";

interface RegisterHandlerInput {
  ctx: TPublicProcedureContext;
  input: TRegisterInputSchema;
}

export async function registerHandler({ input }: RegisterHandlerInput) {
  // Remove +55 country code from phone (ContaAzul expects DDXXXXXXXXX format)
  const phoneWithoutCountryCode = input.phone?.replace(/^\+55/, "");

  let caId: string;

  const existingClient = await caRepository.findClientByCpf(input.cpf);
  if (existingClient) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "CPF já cadastrado",
    });
  }

  const registeredFromFormAt = new Date().toISOString();
  const newAddress:
    | NonNullable<CreateContaAzulPersonParams["enderecos"]>[number]
    | undefined = input.withAddress
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

  const payload: CreateContaAzulPersonParams = {
    cpf: input.cpf,
    email: input.email,
    enderecos: newAddress ? [newAddress] : undefined,
    nome: input.name,
    observacao: `Cadastro do KCash em ${registeredFromFormAt}`,
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
        ...(newAddress
          ? {
              enderecos: address
                .filter((a) => a.cep !== newAddress.cep)
                .concat([newAddress]),
            }
          : {}),
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
      bairro: newAddress?.bairro,
      caId,
      cep: newAddress?.cep,
      cidade: newAddress?.cidade,
      complemento: newAddress?.complemento,
      document: input.cpf,
      email: input.email,
      estado: newAddress?.estado,
      logradouro: newAddress?.logradouro,
      name: input.name,
      numero: newAddress?.numero,
      pais: newAddress?.pais,
      phone: input.phone,
      registeredFromFormAt: new Date().toISOString(),
      type: "Física",
    },
  ]);
}
