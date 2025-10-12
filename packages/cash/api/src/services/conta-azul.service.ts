import { caRepository } from "@cash/db/repositories";
import { clientsSchema } from "@cash/db/schema";
import { z } from "zod";

const FIVE_MINUTES_IN_MS = 300_000; // 5 minutes in milliseconds
const ONE_SECOND_IN_MS = 1000;

const HTTP_STATUS_UNAUTHORIZED = 401;

if (!process.env.CA_CLIENT_ID) {
  throw new Error("Missing CA_CLIENT_ID");
}

if (!process.env.CA_CLIENT_SECRET) {
  throw new Error("Missing CA_CLIENT_SECRET");
}

export const ZRefreshTokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  token_type: z.string(),
});

async function refreshAccessToken() {
  const existingToken = await caRepository.getCAToken();
  if (!existingToken) {
    throw new Error("No token found in db");
  }

  const refreshToken = existingToken.refreshToken;

  const credentials = Buffer.from(
    `${process.env.CA_CLIENT_ID}:${process.env.CA_CLIENT_SECRET}`
  ).toString("base64");

  const params = new URLSearchParams();
  // biome-ignore lint/style/noNonNullAssertion: These were asserted in the if statements above
  params.append("client_id", process.env.CA_CLIENT_ID!);
  // biome-ignore lint/style/noNonNullAssertion: These were asserted in the if statements above
  params.append("client_secret", process.env.CA_CLIENT_SECRET!);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  const response = await fetch("https://auth.contaazul.com/oauth2/token", {
    body: params.toString(),
    cache: "no-store",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `Token refresh failed: ${response.status} - ${await response.text()}`
    );
  }

  const rawData = await response.json();
  const parseResult = ZRefreshTokenResponseSchema.safeParse(rawData);
  if (!parseResult.success) {
    throw new Error(
      `Invalid token response format: ${parseResult.error.message}`
    );
  }

  const data = parseResult.data;

  const expiresAt = new Date(Date.now() + data.expires_in * ONE_SECOND_IN_MS);
  if (existingToken) {
    await caRepository.updateCAToken(existingToken.id, {
      accessToken: data.access_token,
      expiresAt,
      refreshToken: data.refresh_token,
    });
  } else {
    await caRepository.createCAToken({
      accessToken: data.access_token,
      expiresAt,
      refreshToken: data.refresh_token,
    });
  }

  return data.access_token;
}

async function refreshAndGetToken() {
  await refreshAccessToken();
  return await caRepository.getCAToken();
}

async function makeContaAzulRequest<TSchema extends z.ZodType>(
  url: string,
  schema: TSchema,
  options: RequestInit = {}
): Promise<z.infer<TSchema>> {
  let token = await caRepository.getCAToken();

  const now = new Date();
  const expiresAt = new Date(token.expiresAt);
  const fiveMinutesFromNow = new Date(now.getTime() + FIVE_MINUTES_IN_MS);

  if (expiresAt < fiveMinutesFromNow) {
    token = await refreshAndGetToken();
  }

  let response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token.accessToken}`,
    },
  });

  if (response.status === HTTP_STATUS_UNAUTHORIZED) {
    token = await refreshAndGetToken();

    response = await fetch(url, {
      ...options,
      cache: "no-store",
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token.accessToken}`,
      },
    });
  }

  if (!response.ok) {
    throw new Error(
      `Failed to make request to ${url}. Status: ${response.status}`
    );
  }

  const rawData = await response.json();

  const parseResult = schema.safeParse(rawData);

  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues.map((issue) => {
      // Get the actual value that failed
      const path = issue.path.join(".");
      const actualValue = issue.path.reduce((obj, key) => obj?.[key], rawData);

      return {
        expected: issue.message,
        path,
        received: actualValue,
        receivedType: typeof actualValue,
      };
    });
    throw new Error(
      `Invalid response format:\n${JSON.stringify(errorDetails, null, 2)}`
    );
  }

  return parseResult.data;
}

export interface ListContaAzulSalesParams {
  pagina: number;
  tamanho_pagina: number;
  data_inicio?: string;
  data_fim?: string;
}

export const ZCAListSalesResponseSchema = z.looseObject({
  itens: z.array(
    z.object({
      cliente: z.object({
        email: z.string().nullable().describe("Email do cliente"),
        id: z.string().describe("ID do cliente"),
        nome: z.string().describe("Nome do cliente"),
      }),
      criado_em: z.string().describe("Data de criação da venda"),
      id: z.string().describe("ID da venda"),
      numero: z.number().describe("Número da venda"),
      total: z.number().describe("Total da venda"),
    })
  ),
  total_itens: z.number().describe("Total de itens encontrados"),
});

/** @see https://developers.contaazul.com/docs/sales-apis-openapi/v1/searchvendas */
export function listContaAzulSales(params: ListContaAzulSalesParams) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
    } else {
      searchParams.set(key, value.toString());
    }
  }

  const url = `https://api-v2.contaazul.com/v1/venda/busca?${
    searchParams ?? ""
  }`;

  return makeContaAzulRequest(url, ZCAListSalesResponseSchema, {
    method: "GET",
  });
}

export interface ListContaAzulPersonsParams {
  ids: string[];
  tamanho_pagina: number;
  pagina: number;
}

export const ZCAListPersonsResponseSchema = z.object({
  items: z.array(
    z.object({
      documento: z.string().describe("Documento da pessoa (CPF/CNPJ)"),
      email: z.string().describe("Email da pessoa"),
      id: z.string().describe("ID da pessoa"),
      nome: z
        .string()
        .describe("Nome da pessoa (física, jurídica ou estrangeira)"),
      telefone: z.string().describe("Telefone da pessoa"),
      tipo_pessoa: clientsSchema.shape.type,
    })
  ),
  totalItems: z.number().describe("Total de itens encontrados"),
});

/** @see https://developers.contaazul.com/docs/person-apis-openapi/v1/listarpessoas */
export function listContaAzulPersons(params: ListContaAzulPersonsParams) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
    } else {
      searchParams.set(key, value.toString());
    }
  }

  const url = `https://api-v2.contaazul.com/v1/pessoas?${searchParams ?? ""}`;

  return makeContaAzulRequest(url, ZCAListPersonsResponseSchema, {
    method: "GET",
  });
}
