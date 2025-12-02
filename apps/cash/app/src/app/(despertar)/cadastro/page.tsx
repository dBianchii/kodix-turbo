import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro | Despertar Cashback",
};

// biome-ignore lint/performance/noBarrelFile: Should remove this rule?
export { CadastroPage as default } from "./_components/cadastro-page";
