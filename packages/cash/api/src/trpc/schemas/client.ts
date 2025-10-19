import { ZCpfSchema, ZPhoneSchema } from "@kodix/shared/schemas";
import { z } from "zod";

export const ZRegisterInterestInputSchema = z.object({
  bairro: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres"),
  cep: z.string().min(8, "CEP inválido").max(9, "CEP inválido"),
  cidade: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  complemento: z.string().optional(),
  cpf: ZCpfSchema,
  email: z.email("Email inválido"),
  estado: z.string().length(2, "Estado deve ter 2 caracteres"),
  logradouro: z.string().min(3, "Logradouro deve ter pelo menos 3 caracteres"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  numero: z.string().min(1, "Número é obrigatório"),
  phone: ZPhoneSchema.refine(
    (phone) => phone.startsWith("+55"),
    "Telefone deve ser com o código do país (+55)"
  ),
});
export type TRegisterInterestInputSchema = z.infer<
  typeof ZRegisterInterestInputSchema
>;
