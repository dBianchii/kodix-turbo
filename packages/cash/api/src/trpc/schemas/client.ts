import { ZCpfSchema, ZPhoneSchema } from "@kodix/shared/schemas";
import { z } from "zod";

const zCommonFields = z.object({
  bairro: z
    .string()
    .min(2, "Bairro deve ter pelo menos 2 caracteres")
    .optional(),
  cep: z.string().min(8, "CEP inválido").max(9, "CEP inválido").optional(),
  cidade: z
    .string()
    .min(2, "Cidade deve ter pelo menos 2 caracteres")
    .optional(),
  complemento: z.string().optional(),
  cpf: ZCpfSchema,
  estado: z.string().length(2, "Estado deve ter 2 caracteres").optional(),
  isUpdate: z.boolean(),
  logradouro: z
    .string()
    .min(3, "Logradouro deve ter pelo menos 3 caracteres")
    .optional(),
  numero: z.string().optional(),
  phone: ZPhoneSchema.refine(
    (phone) => phone?.startsWith("+55"),
    "Telefone deve ser com o código do país (+55)",
  ).optional(),
  withAddress: z.boolean().default(false),
});

const zName = z.string().min(2, "Nome deve ter pelo menos 2 caracteres");
export const ZRegisterInputSchema = z.discriminatedUnion("isUpdate", [
  z.object({
    ...zCommonFields.shape,
    email: z.email("Email inválido").toLowerCase(),
    isUpdate: z.literal(false),
    name: zName,
  }),
  z.object({
    ...zCommonFields.shape,
    email: z.email("Email inválido").toLowerCase().optional(),
    isUpdate: z.literal(true),
    name: zName.optional(),
  }),
]);
export type TRegisterInputSchema = z.infer<typeof ZRegisterInputSchema>;
export type RegisterInputSchemaKeys = Exclude<
  keyof TRegisterInputSchema,
  "cpf" | "isUpdate" | "withAddress"
>;

export const ZGetByCpfInputSchema = z.object({
  cpf: ZCpfSchema,
});
export type TGetByCpfInputSchema = z.infer<typeof ZGetByCpfInputSchema>;

export const CLIENTS_SORT_FIELDS = [
  "name",
  "registeredFromFormAt",
  "totalAvailableCashback",
] as const;

export const ZClientsSortSchema = z.object({
  desc: z.boolean(),
  id: z.enum(CLIENTS_SORT_FIELDS),
});
export type TClientsSortSchema = z.infer<typeof ZClientsSortSchema>;

export const DEFAULT_CLIENT_TABLE_SORT = [
  { desc: true, id: "totalAvailableCashback" },
] satisfies TClientsSortSchema[];

export const ZListClientsInputSchema = z.object({
  globalSearch: z.string().optional().default(""),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(250).default(50),
  sort: z
    .array(ZClientsSortSchema)
    .default(DEFAULT_CLIENT_TABLE_SORT)
    .transform((value) => (value.length ? value : DEFAULT_CLIENT_TABLE_SORT)),
});
export type TListClientsInputSchema = z.infer<typeof ZListClientsInputSchema>;

export const ZGetClientByIdInputSchema = z.object({
  clientId: z.string(),
});
export type TGetClientByIdInputSchema = z.infer<
  typeof ZGetClientByIdInputSchema
>;
