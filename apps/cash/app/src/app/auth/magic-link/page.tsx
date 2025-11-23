import { redirect } from "next/navigation";
import { trpcCaller } from "@cash/api/trpc/react/server";

export default async function MagicLinkPage({
  searchParams,
}: PageProps<"/auth/magic-link">) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">Erro ao verificar token</h1>
          <p className="text-destructive-foreground">Token não encontrado</p>
        </div>
      </div>
    );
  }

  try {
    await trpcCaller.auth.verifyMagicLink({ token });
    redirect("/home");
  } catch (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">Erro ao verificar token</h1>
          <p className="text-red-600">
            {error instanceof Error
              ? error.message
              : "Token inválido ou expirado"}
          </p>
        </div>
      </div>
    );
  }
}
