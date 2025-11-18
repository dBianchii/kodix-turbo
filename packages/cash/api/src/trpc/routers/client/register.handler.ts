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

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Should we remove this rule?
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
    let existingPersonName: string | undefined;
    if (existingPerson) {
      existingPersonName = existingPerson.nome;
      const addresses = existingPerson.endereco
        ? [existingPerson.endereco]
        : [];

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

      caId = existingPerson.id;
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

    const existingClient = await caRepository.findClientByCaId(caId);

    if (existingClient) {
      await caRepository.updateClientByCaId(caId, {
        ...dbFields,
        ...(input.name && { name: input.name }),
      });
    } else {
      const name = input.name ?? existingPersonName;
      if (!name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name is required to create a client",
        });
      }

      await caRepository.createClient({
        ...dbFields,
        name,
      });
    }
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
