import { useQueryStates } from "nuqs";
import { type ParserMap, parseAsInteger, parseAsString } from "nuqs/server";

export const createClientsSearchParamsParsers = {
  globalSearch: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(50),
  sort: parseAsString.withDefault("totalAvailableCashback.desc"),
} satisfies ParserMap;

export const useClientsSearchParams = () =>
  useQueryStates(createClientsSearchParamsParsers);
