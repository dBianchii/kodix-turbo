import { caRepository } from "@cash/db/repositories";
import { clientsSchema } from "@cash/db/schema";
import { z } from "zod";

const emptyToNull = (val: string | undefined) =>
  val === "" || val === "-" ? null : val;

const FIVE_MINUTES_IN_MS = 300_000; // 5 minutes in milliseconds
const ONE_SECOND_IN_MS = 1000;

const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_TOO_MANY_REQUESTS = 429;

// Rate limiting configuration for Conta Azul API
// API allows 20 requests per second, we stay conservative with 15 to avoid spikes
const RATE_LIMIT_MAX_REQUESTS = 15;
const RATE_LIMIT_TIME_WINDOW_MS = 1000; // 1 second

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 second
const MAX_RETRY_DELAY_MS = 10_000; // 10 seconds

if (!process.env.CA_CLIENT_ID) {
  throw new Error("Missing CA_CLIENT_ID");
}

if (!process.env.CA_CLIENT_SECRET) {
  throw new Error("Missing CA_CLIENT_SECRET");
}

const ZRefreshTokenResponseSchema = z.object({
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
      expiresAt: expiresAt.toISOString(),
      refreshToken: data.refresh_token,
    });
  } else {
    await caRepository.createCAToken({
      accessToken: data.access_token,
      expiresAt: expiresAt.toISOString(),
      refreshToken: data.refresh_token,
    });
  }

  return data.access_token;
}

async function refreshAndGetToken() {
  await refreshAccessToken();
  return await caRepository.getCAToken();
}

/**
 * Simple rate limiter to avoid exceeding Conta Azul API limits
 * Tracks requests in a time window and adds delays when necessary
 */
class RateLimiter {
  private requestTimestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindowMs: number;

  constructor(maxRequests: number, timeWindowMs: number) {
    this.maxRequests = maxRequests;
    this.timeWindowMs = timeWindowMs;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    // Remove timestamps outside the current time window
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.timeWindowMs
    );

    // If we've hit the limit, wait until the oldest request falls outside the window
    if (this.requestTimestamps.length >= this.maxRequests) {
      const oldestTimestamp = this.requestTimestamps[0];
      if (oldestTimestamp) {
        const waitTime = this.timeWindowMs - (now - oldestTimestamp) + 10; // +10ms buffer
        if (waitTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
        // Clean up again after waiting
        const newNow = Date.now();
        this.requestTimestamps = this.requestTimestamps.filter(
          (timestamp) => newNow - timestamp < this.timeWindowMs
        );
      }
    }

    // Record this request
    this.requestTimestamps.push(Date.now());
  }
}

// Global rate limiter instance for all Conta Azul API requests
const rateLimiter = new RateLimiter(
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_TIME_WINDOW_MS
);

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(retryCount: number): number {
  return Math.min(INITIAL_RETRY_DELAY_MS * 2 ** retryCount, MAX_RETRY_DELAY_MS);
}

/**
 * Make an authenticated fetch request with token refresh if needed
 */
async function fetchWithAuth(
  url: string,
  options: RequestInit
): Promise<Response> {
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

  return response;
}

/**
 * Process successful response
 */
async function processResponse<TSchema extends z.ZodType>(
  response: Response,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  if (response.status === 204) {
    return undefined as z.infer<TSchema>;
  }

  const rawData = await response.json();
  const parseResult = schema.safeParse(rawData);

  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues.map((issue) => {
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

async function makeContaAzulRequest<TSchema extends z.ZodType>(
  url: string,
  schema: TSchema,
  options: RequestInit = {}
): Promise<z.infer<TSchema>> {
  let retryCount = 0;

  while (retryCount <= MAX_RETRIES) {
    try {
      await rateLimiter.acquire();
      const response = await fetchWithAuth(url, options);

      // Handle rate limiting
      if (response.status === HTTP_STATUS_TOO_MANY_REQUESTS) {
        if (retryCount >= MAX_RETRIES) {
          const errorBody = await response.text();
          throw new Error(
            `Rate limit exceeded after ${MAX_RETRIES} retries. URL: ${url}. Body: ${errorBody}`
          );
        }
        const delay = calculateRetryDelay(retryCount);
        // biome-ignore lint/suspicious/noConsole: Logging for observability
        console.warn(`Rate limited on ${url}. Retrying in ${delay}ms`);
        await sleep(delay);
        retryCount++;
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Failed to make request to ${url}. Status: ${response.status}. Body: ${errorBody}`
        );
      }

      return await processResponse(response, schema);
    } catch (error) {
      // Retry on rate limit errors
      if (
        error instanceof Error &&
        error.message.includes("Status: 429") &&
        retryCount < MAX_RETRIES
      ) {
        const delay = calculateRetryDelay(retryCount);
        // biome-ignore lint/suspicious/noConsole: Logging for observability
        console.warn(`Rate limit error on ${url}. Retrying in ${delay}ms`);
        await sleep(delay);
        retryCount++;
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Request failed after ${MAX_RETRIES} retries`);
}

interface ListContaAzulSalesParams {
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

interface ListContaAzulPersonsParams {
  ids?: string[];
  tamanho_pagina: 10 | 20 | 50 | 100 | 200 | 500 | 1000;
  pagina: number;
  com_endereco?: true;
  busca?: string;
}

export const ZCAListPersonsResponseSchema = z.object({
  items: z.array(
    z.object({
      documento: z
        .string()
        .transform(emptyToNull) // Some clients have an empty string for the document
        .describe("Documento da pessoa (CPF/CNPJ)"),
      email: z
        .string()
        .transform(emptyToNull) // Some clients have an empty string for the email
        .describe("Email da pessoa"),
      endereco: z
        .object({
          bairro: z.string().optional(),
          cep: z.string().optional(),
          cidade: z.string().optional(),
          complemento: z.string().optional(),
          estado: z.string().optional(),
          logradouro: z.string().optional(),
          numero: z.string().optional(),
          pais: z.string().optional(),
        })
        .optional(),
      id: z.string().describe("ID da pessoa"),
      nome: z
        .string()
        .describe("Nome da pessoa (física, jurídica ou estrangeira)"),
      telefone: z
        .string()
        .transform(emptyToNull)
        .describe("Telefone da pessoa"),
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

  const url = `https://api-v2.contaazul.com/v1/pessoas?${searchParams}`;

  return makeContaAzulRequest(url, ZCAListPersonsResponseSchema, {
    method: "GET",
  });
}

export interface CreateContaAzulPersonParams {
  cpf?: string;
  email?: string;
  nome: string;
  observacao?: string;
  telefone_celular?: string;
  perfis: Array<{
    tipo_perfil: "Cliente" | "Fornecedor" | "Transportadora";
  }>;
  tipo_pessoa: "Física" | "Jurídica" | "Estrangeira";
  enderecos?: Array<{
    bairro?: string;
    cep?: string;
    cidade?: string;
    complemento?: string;
    estado?: string;
    logradouro?: string;
    numero?: string;
    pais?: string;
  }>;
}

const ZCACreatePersonResponseSchema = z.object({
  cpf: z.string().optional().describe("CPF da pessoa física"),
  email: z.string().optional().describe("Email da pessoa"),
  enderecos: z
    .array(
      z.object({
        bairro: z.string().optional().describe("Bairro do endereço"),
        cep: z.string().optional().describe("CEP do endereço"),
        cidade: z.string().optional().describe("Cidade do endereço"),
        complemento: z.string().optional().describe("Complemento do endereço"),
        estado: z.string().optional().describe("Estado do endereço"),
        id: z.string().optional().describe("ID do endereço"),
        id_cidade: z.number().optional().describe("ID da cidade"),
        logradouro: z.string().optional().describe("Logradouro do endereço"),
        numero: z.string().optional().describe("Número do endereço"),
        pais: z.string().optional().describe("País do endereço"),
      })
    )
    .optional()
    .describe("Lista de endereços"),
  estrangeiro: z
    .boolean()
    .optional()
    .describe("Indica se a pessoa é estrangeira"),
  id: z.string().describe("ID da pessoa criada"),
  nome: z.string().describe("Nome da pessoa"),
  observacao: z.string().optional().describe("Observações sobre a pessoa"),
  origem: z.string().optional().describe("Origem da criação da pessoa"),
  telefone_celular: z.string().optional().describe("Telefone celular"),
  tipo_pessoa: z
    .string()
    .describe("Tipo de pessoa: Física, Jurídica ou Estrangeira"),
});

/** @see https://developers.contaazul.com/open-api-docs/open-api-person/v1/criarpessoa */
export function createContaAzulPerson(params: CreateContaAzulPersonParams) {
  return makeContaAzulRequest(
    "https://api-v2.contaazul.com/v1/pessoas",
    ZCACreatePersonResponseSchema,
    {
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    }
  );
}

export interface UpdateContaAzulPersonParams {
  id: string;
  cpf?: string;
  email?: string;
  nome?: string;
  observacao?: string;
  telefone_celular?: string;
  perfis?: Array<{
    tipo_perfil: "Cliente" | "Fornecedor" | "Transportadora";
  }>;
  tipo_pessoa?: "Física" | "Jurídica" | "Estrangeira";
  enderecos?: Array<{
    bairro?: string;
    cep?: string;
    cidade?: string;
    complemento?: string;
    estado?: string;
    logradouro?: string;
    numero?: string;
    pais?: string;
  }>;
}

/** @see https://developers.contaazul.com/open-api-docs/open-api-person/v1/atualizarpessoaparcialmenteporid */
export function updateContaAzulPerson(params: UpdateContaAzulPersonParams) {
  const { id, ...body } = params;
  const url = `https://api-v2.contaazul.com/v1/pessoas/${id}`;

  return makeContaAzulRequest(url, z.undefined(), {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });
}

const ZCAGetPersonResponseSchema = z.object({
  documento: z
    .string()
    .transform(emptyToNull)
    .describe("Documento da pessoa (CPF/CNPJ)"),
  email: z.string().transform(emptyToNull).describe("Email da pessoa"),
  enderecos: z
    .array(
      z.object({
        bairro: z.string().describe("Bairro do endereço"),
        cep: z.string().describe("CEP do endereço"),
        cidade: z.string().describe("Cidade do endereço"),
        complemento: z
          .string()
          .optional()
          .transform(emptyToNull)
          .describe("Complemento do endereço"),
        estado: z.string().describe("Estado do endereço"),
        id: z.string().describe("ID do endereço"),
        logradouro: z.string().describe("Logradouro do endereço"),
        numero: z.string().describe("Número do endereço"),
        pais: z.string().describe("País do endereço"),
      })
    )
    .optional()
    .describe("Lista de endereços"),
  id: z.string().describe("ID da pessoa"),
  nome: z.string().describe("Nome da pessoa"),
  telefone_celular: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .describe("Telefone celular da pessoa"),
  tipo_pessoa: clientsSchema.shape.type.describe("Tipo de pessoa"),
});

/** @see https://developers.contaazul.com/open-api-docs/open-api-person/v1/retornarapessoaporid */
export function getContaAzulPerson(id: string) {
  const url = `https://api-v2.contaazul.com/v1/pessoas/${id}`;

  return makeContaAzulRequest(url, ZCAGetPersonResponseSchema, {
    method: "GET",
  });
}

interface ListSaleItemsBySaleIdParams {
  id_venda: string;
  pagina: number;
  tamanho_pagina: number;
}

export const ZCAListSaleItemsResponseSchema = z.object({
  itens: z.array(
    z.object({
      id: z.string(),
      id_item: z.string(),
      quantidade: z.number(),
      valor: z.number(),
    })
  ),
  itens_totais: z.number(),
});

/** @see https://developers.contaazul.com/docs/sales-apis-openapi/v1/retornarositensdeumavenda */
export function listSaleItemsBySaleId(params: ListSaleItemsBySaleIdParams) {
  const { id_venda, ...queryParams } = params;
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(queryParams)) {
    if (value === undefined) continue;
    searchParams.set(key, value.toString());
  }

  const queryString = searchParams.toString();
  const url = `https://api-v2.contaazul.com/v1/venda/${id_venda}/itens${
    queryString ? `?${queryString}` : ""
  }`;

  return makeContaAzulRequest(url, ZCAListSaleItemsResponseSchema, {
    method: "GET",
  });
}

export const ZCAGetProductResponseSchema = z.object({
  estoque: z.object({
    valor_venda: z.number(),
  }),
  id: z.string(),
  nome: z.string(),
});

/** @see https://developers.contaazul.com/docs/product-apis-openapi/v1/retornarprodutoporid */
export function getProductById(id: string) {
  const url = `https://api-v2.contaazul.com/v1/produtos/${id}`;

  return makeContaAzulRequest(url, ZCAGetProductResponseSchema, {
    method: "GET",
  });
}

/**
 * Process items in batches with controlled concurrency
 * This helps prevent overwhelming the API with too many simultaneous requests
 *
 * @param items - Array of items to process
 * @param processor - Async function to process each item
 * @param concurrency - Maximum number of items to process simultaneously
 * @returns Promise that resolves with array of results
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }

  return results;
}
