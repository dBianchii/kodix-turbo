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

export const BRAZIL_PHONE_COUNTRY_CODE_REGEX = /^\+55/;

export async function registerHandler({ input }: RegisterHandlerInput) {
  // const posthog = getPostHogServer();

  // Remove +55 country code from phone (ContaAzul expects DDXXXXXXXXX format)
  const phoneWithoutCountryCode = input.phone?.replace(
    BRAZIL_PHONE_COUNTRY_CODE_REGEX,
    "",
  );

  let caId: string;

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
    if (existingPerson) {
      const address = existingPerson.endereco ? [existingPerson.endereco] : [];

      await updateContaAzulPerson({
        ...payload,
        ...(input.name ? { nome: input.name } : {}),
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

    const dbUpdateOrCreateFields = {
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
      registeredFromFormAt: new Date().toISOString(),
      type: "Física" as const,
    };

    if (input.isUpdate) {
      await caRepository.updateClientByCaId(caId, {
        ...dbUpdateOrCreateFields,
        name: input.name,
      });
      return;
    }

    await caRepository.createClient({
      ...dbUpdateOrCreateFields,
      name: input.name,
    });
  } catch (error) {
    // posthog.captureException(error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
