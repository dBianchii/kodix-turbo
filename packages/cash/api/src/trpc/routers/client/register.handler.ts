import { caRepository } from "@cash/db/repositories";
import { getPostHogServer } from "@kodix/posthog";
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

export const BRAZIL_PHONE_COUNTRY_CODE_REGEX = /^\+55/;

function prepareAddress(input: TRegisterInputSchema) {
  if (!input.withAddress) return;

  return {
    bairro: input.bairro,
    cep: input.cep,
    cidade: input.cidade,
    complemento: input.complemento,
    estado: input.estado,
    logradouro: input.logradouro,
    numero: input.numero,
    pais: "Brasil",
  };
}

async function updateExistingPerson(
  existingPerson: {
    id: string;
    endereco?: NonNullable<CreateContaAzulPersonParams["enderecos"]>[number];
  },
  payload: Omit<CreateContaAzulPersonParams, "nome">,
  input: TRegisterInputSchema,
  newAddress:
    | NonNullable<CreateContaAzulPersonParams["enderecos"]>[number]
    | undefined,
) {
  const addresses = existingPerson.endereco ? [existingPerson.endereco] : [];

  await updateContaAzulPerson({
    ...payload,
    id: existingPerson.id,
    ...(input.name && { nome: input.name }),
    ...(newAddress && {
      enderecos: addresses
        .filter((a) => a.cep !== newAddress.cep)
        .concat([newAddress]),
    }),
  });
  return existingPerson.id;
}

async function syncToDatabase(
  caId: string,
  input: TRegisterInputSchema,
  newAddress:
    | NonNullable<CreateContaAzulPersonParams["enderecos"]>[number]
    | undefined,
  registeredFromFormAt: string,
) {
  const dbFields = {
    bairro: newAddress?.bairro,
    caId,
    cep: newAddress?.cep,
    cidade: newAddress?.cidade,
    complemento: newAddress?.complemento,
    document: input.cpf,
    email: input.email,
    estado: newAddress?.estado,
    logradouro: newAddress?.logradouro,
    numero: newAddress?.numero,
    pais: newAddress?.pais,
    phone: input.phone,
    registeredFromFormAt,
    type: "Física" as const,
  };

  if (input.isUpdate) {
    await caRepository.updateClientByCaId(caId, {
      ...dbFields,
      name: input.name,
    });
    return;
  }

  await caRepository.createClient({
    ...dbFields,
    name: input.name,
  });
}

export async function registerHandler({ input }: RegisterHandlerInput) {
  const phoneWithoutCountryCode = input.phone?.replace(
    BRAZIL_PHONE_COUNTRY_CODE_REGEX,
    "",
  );

  const registeredFromFormAt = new Date().toISOString();
  const newAddress = prepareAddress(input);

  const payload: Omit<CreateContaAzulPersonParams, "nome"> = {
    cpf: input.cpf,
    email: input.email,
    enderecos: newAddress ? [newAddress] : undefined,
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

    const existingPerson = items?.[0];

    let caId: string;
    if (existingPerson) {
      caId = await updateExistingPerson(
        existingPerson,
        payload,
        input,
        newAddress,
      );
    } else {
      if (input.isUpdate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Client not found",
        });
      }
      const { id } = await createContaAzulPerson({
        ...payload,
        nome: input.name,
      });
      caId = id;
    }

    await syncToDatabase(caId, input, newAddress, registeredFromFormAt);
  } catch (error) {
    const posthog = getPostHogServer();

    posthog.captureException(error);
    await posthog.shutdown();

    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
