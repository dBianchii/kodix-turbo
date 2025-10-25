import { ZCpfSchema, ZPhoneSchema } from "@kodix/shared/schemas";
import { z } from "zod";

export const ZRegisterInputSchema = z.object({
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
  email: z.email("Email inválido"),
  estado: z.string().length(2, "Estado deve ter 2 caracteres").optional(),
  logradouro: z
    .string()
    .min(3, "Logradouro deve ter pelo menos 3 caracteres")
    .optional(),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  numero: z.string().optional(),
  phone: ZPhoneSchema.refine(
    (phone) => phone?.startsWith("+55"),
    "Telefone deve ser com o código do país (+55)"
  ).optional(),
});
export type TRegisterInputSchema = z.infer<typeof ZRegisterInputSchema>;

export const ZGetByCpfInputSchema = z.object({
  cpf: ZCpfSchema,
});
export type TGetByCpfInputSchema = z.infer<typeof ZGetByCpfInputSchema>;
