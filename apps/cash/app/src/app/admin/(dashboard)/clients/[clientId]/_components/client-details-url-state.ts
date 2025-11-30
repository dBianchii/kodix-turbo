import { useQueryStates } from "nuqs";
import { type ParserMap, parseAsStringLiteral } from "nuqs/server";

const tabValues = ["cashbacks", "vouchers"] as const;

export const createClientDetailsSearchParamsParsers = {
  tab: parseAsStringLiteral(tabValues).withDefault("cashbacks"),
} satisfies ParserMap;

export const useClientDetailsSearchParams = () =>
  useQueryStates(createClientDetailsSearchParamsParsers);
