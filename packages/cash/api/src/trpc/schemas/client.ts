import { z } from "zod";

export const ZRegisterInterestInputSchema = z.object({
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone inválido").max(15, "Telefone inválido"),
});

export type RegisterInterestInput = z.infer<
  typeof ZRegisterInterestInputSchema
>;
