import { caRepository } from "@cash/db/repositories";
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

export const ZCAListSalesResponseSchema = z.object({
  itens: z
    .array(
      z.object({
        cliente: z
          .object({
            cep: z.string().nullish(),
            cidade: z.string().nullish(),
            email: z.string().nullish(),
            endereco: z.string().nullish(),
            estado: z.string().nullish(),
            id: z.string().nullish(),
            nome: z.string().nullish(),
            pais: z.string().nullish(),
            telefone: z.string().nullish(),
          })
          .optional(),
        condicao_pagamento: z.boolean().optional(),
        criado_em: z.any().optional(),
        data: z.string().optional(),
        id: z.string().optional(),
        id_legado: z.number().optional(),
        itens: z.string().optional(),
        numero: z.number().optional(),
        situacao: z
          .object({
            descricao: z.string().optional(),
            nome: z.string().optional(),
          })
          .optional(),
        status_email: z
          .object({
            enviado_em: z.string().optional(),
            status: z.string().optional(),
          })
          .optional(),
        tipo: z.string().optional(),
        total: z.number().optional(),
        versao: z.number().optional(),
      })
    )
    .optional(),
  quantidades: z
    .object({
      aprovado: z.number().optional(),
      cancelado: z.number().optional(),
      esperando_aprovacao: z.number().optional(),
      total: z.number().optional(),
    })
    .optional(),
  totais: z
    .object({
      aprovado: z.number().optional(),
      cancelado: z.number().optional(),
      esperando_aprovacao: z.number().optional(),
      total: z.number().optional(),
    })
    .optional(),
  total_itens: z.number().optional(),
});

export type ZCAListSalesResponse = z.infer<typeof ZCAListSalesResponseSchema>;

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

  if (schema) {
    const parseResult = schema.safeParse(rawData);

    if (!parseResult.success) {
      throw new Error(`Invalid response format: ${parseResult.error.message}`);
    }

    return parseResult.data;
  }

  const data = rawData as z.infer<TSchema>;
  return data;
}

export interface ListSalesParams {
  pagina?: number;
  tamanhoPagina?: number;
  campoOrdenadoAscendente?: "NUMERO" | "CLIENTE" | "DATA";
  campoOrdenadoDescendente?: "NUMERO" | "CLIENTE" | "DATA";
  termoBusca?: string;
  dataInicio?: string;
  dataFim?: string;
  dataCriacaoDe?: string;
  dataCriacaoAte?: string;
  idsVendedores?: string[];
  idsClientes?: string[];
  idsNaturezaOperacao?: string[];
  situacoes?: string[];
  tipos?: string[];
  origens?: string[];
  numeros?: string[];
  idsCategorias?: string[];
  idsProdutos?: string[];
  pendente?: boolean;
  totais?: string;
  idsLegadoDonos?: string[];
  idsLegadoClientes?: string[];
  idsLegadoProdutos?: string[];
  idsLegadoCategorias?: string[];
}

const listSalesParamsToCAParams: Record<keyof ListSalesParams, string> = {
  campoOrdenadoAscendente: "campo_ordenado_ascendente",
  campoOrdenadoDescendente: "campo_ordenado_descendente",
  dataCriacaoAte: "data_criacao_ate",
  dataCriacaoDe: "data_criacao_de",
  dataFim: "data_fim",
  dataInicio: "data_inicio",
  idsCategorias: "ids_categorias",
  idsClientes: "ids_clientes",
  idsLegadoCategorias: "ids_legado_categorias",
  idsLegadoClientes: "ids_legado_clientes",
  idsLegadoDonos: "ids_legado_donos",
  idsLegadoProdutos: "ids_legado_produtos",
  idsNaturezaOperacao: "ids_natureza_operacao",
  idsProdutos: "ids_produtos",
  idsVendedores: "ids_vendedores",
  numeros: "numeros",
  origens: "origens",
  pagina: "pagina",
  pendente: "pendente",
  situacoes: "situacoes",
  tamanhoPagina: "tamanho_pagina",
  termoBusca: "termo_busca",
  tipos: "tipos",
  totais: "totais",
} as const;

/** @see https://developers.contaazul.com/docs/sales-apis-openapi/v1/searchvendas */
export function listSales(params: ListSalesParams) {
  const searchParams = new URLSearchParams();

  for (const [camelKey, value] of Object.entries(params)) {
    if (value === undefined) continue;

    const snakeKey =
      listSalesParamsToCAParams[
        camelKey as keyof typeof listSalesParamsToCAParams
      ];

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(snakeKey, item);
      }
    } else {
      searchParams.set(snakeKey, value.toString());
    }
  }

  const url = `https://api-v2.contaazul.com/v1/venda/busca?${
    searchParams ?? ""
  }`;

  return makeContaAzulRequest(url, ZCAListSalesResponseSchema, {
    method: "GET",
  });
}
