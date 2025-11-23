import {
  caRepository,
  cashbackRepository,
  magicLinkRepository,
} from "@cash/db/repositories";
import CashWelcome from "@cash/react-email/cash-welcome";
import dayjs from "@kodix/dayjs";
import { getPostHogServer } from "@kodix/posthog";
import { KODIX_NOTIFICATION_FROM_EMAIL } from "@kodix/shared/constants";
import { getBaseUrl, nanoid } from "@kodix/shared/utils";
import { TRPCError } from "@trpc/server";

import type { TPublicProcedureContext } from "../../procedures";
import type { TRegisterInputSchema } from "../../schemas/client";
import { resend } from "../../../sdks/resend";
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

    let clientId: string;
    if (existingClient) {
      await caRepository.updateClientByCaId(caId, {
        ...dbFields,
        ...(input.name && { name: input.name }),
      });
      clientId = existingClient.id;
    } else {
      const name = input.name ?? existingPersonName;
      if (!name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name is required to create a client",
        });
      }

      const [newClient] = await caRepository.createClient({
        ...dbFields,
        name,
      });
      if (!newClient) {
        throw new Error("Failed to create client");
      }
      clientId = newClient.id;
    }

    // TODO: Migrate to trigger.dev
    // await delay(2, "days");
    await sendCashbackEmail({
      clientEmail: input.email ?? "", //TODO: Email is required to send cashback email. Do we need to make email required in the clients table?,
      clientId,
      clientName: input.name ?? existingPersonName ?? "Cliente",
    });
  } catch (error) {
    const posthog = getPostHogServer();
    posthog.captureException(error);
    await posthog.shutdown();

    throw error;
  }
}

async function sendCashbackEmail({
  clientId,
  clientEmail,
  clientName,
}: {
  clientId: string;
  clientEmail: string;
  clientName: string;
}) {
  const totalCashback =
    await cashbackRepository.getTotalCashbackByClientId(clientId);

  if (totalCashback <= 0) {
    return;
  }

  const token = nanoid();
  const expiresAt = dayjs().add(7, "day").toISOString();

  await magicLinkRepository.createMagicLinkToken({
    clientId,
    expiresAt,
    token,
  });

  const magicLinkUrl = `${getBaseUrl()}/auth/magic-link?token=${token}`;

  const cashbackFormatted = totalCashback.toFixed(2).replace(".", ",");

  await resend.emails.send({
    from: KODIX_NOTIFICATION_FROM_EMAIL, //TODO: Notification email must be from despertar
    react: CashWelcome({
      cashbackAmount: cashbackFormatted,
      registerUrl: magicLinkUrl,
      username: clientName,
    }),
    subject: `Você ganhou R$ ${cashbackFormatted} de cashback!`,
    to: clientEmail,
  });
}
