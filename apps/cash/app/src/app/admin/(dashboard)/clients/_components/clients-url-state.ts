import {
  CLIENTS_SORT_FIELDS,
  DEFAULT_CLIENT_TABLE_SORT,
} from "@cash/api/trpc/schemas/client";
import { useQueryStates } from "nuqs";
import {
  type ParserMap,
  parseAsInteger,
  parseAsJson,
  parseAsString,
} from "nuqs/server";
import { z } from "zod";

const zSort = z.array(
  z.object({
    desc: z.boolean(),
    id: z.enum(CLIENTS_SORT_FIELDS),
  }),
);

export const clientsSearchParamsParserMap = {
  globalSearch: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(50),
  sort: parseAsJson(zSort.parse).withDefault(DEFAULT_CLIENT_TABLE_SORT),
} satisfies ParserMap;

export const useClientsSearchParams = () =>
  useQueryStates(clientsSearchParamsParserMap);
