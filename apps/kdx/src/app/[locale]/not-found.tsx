import { LuArrowLeft } from "react-icons/lu";

import { buttonVariants } from "@kdx/ui/button";

import { Link } from "~/i18n/routing";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="container mx-auto flex max-w-3xl flex-col items-center space-y-8 text-center">
        <div className="h-64 w-full md:h-80">
          <span className="text-muted-foreground/40 text-9xl font-bold underline">
            404
          </span>
        </div>

        <h1 className="text-4xl font-bold tracking-tighter md:text-6xl">
          Página não encontrada
        </h1>

        <p className="max-w-xl text-lg md:text-xl">
          Parece que você se perdeu no ecossistema Kodix. A página que você está
          procurando não existe ou foi movida.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link href="/" className={buttonVariants({ variant: "secondary" })}>
            <LuArrowLeft className="mr-2 size-4" />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
