import { getTranslations, setRequestLocale } from "next-intl/server";
import { LuChevronRight } from "react-icons/lu";

import { getBaseUrl } from "@kdx/shared";
import { cn } from "@kdx/ui";
import { buttonVariants } from "@kdx/ui/button";
import { RadialGradient } from "@kdx/ui/magic-ui/radial-gradient";

import { Link } from "~/i18n/routing";

import { Footer } from "../_components/footer";
import { StaticHeader } from "../_components/header/static-header";
import { HeroBento } from "../_components/hero-bento";
import { HeroLamp } from "../_components/hero-lamp";
import { ClientUrl } from "../client-url";

export const dynamic = "error"; //? If any dynamic functions are used, next.js will throw an error if the page is not generated statically

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale;
  setRequestLocale(locale);

  const t = await getTranslations();

  const url = getBaseUrl();

  return (
    <>
      <StaticHeader />
      <main className="flex-1">
        The server url is {url}
        <ClientUrl />
        <section id="hero">
          <RadialGradient
            origin="top"
            size={600}
            from="rgba(120,119,198,0.3)"
          />
          <div className="container mx-auto flex flex-col">
            <div className="mt-10 grid grid-cols-1">
              <div className="flex flex-col items-center gap-6 pb-8 text-center">
                <h1 className="text-balance bg-linear-to-br from-30% from-black to-black/60 bg-clip-text py-6 font-semibold text-5xl text-transparent leading-none tracking-tighter sm:text-6xl md:text-7xl lg:text-7xl dark:from-white dark:to-white">
                  {t("home.title")}
                </h1>
                <p className="max-w-[64rem] text-balance text-muted-foreground text-xl md:text-xl">
                  {t("home.description")}
                </p>
                <div className="flex flex-col gap-4 lg:flex-row">
                  <Link
                    href="/apps"
                    className={cn(
                      buttonVariants({
                        variant: "default",
                        size: "lg",
                      }),
                      "gap-2 whitespace-pre md:flex",
                      "group relative w-full gap-1 overflow-hidden rounded-full font-semibold text-sm tracking-tighter",
                    )}
                  >
                    {t("Browse apps")}
                    <LuChevronRight className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/signin"
                    className={cn(
                      buttonVariants({
                        size: "lg",
                        variant: "ghost",
                      }),
                      "gap-2 whitespace-pre md:flex",
                      "group relative w-full gap-1 overflow-hidden rounded-full font-semibold text-sm tracking-tighter",
                    )}
                  >
                    {t("Get started")}
                    <LuChevronRight className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="px-16">
          <HeroBento />
          <HeroLamp />
        </section>
        <section id="contact"></section>
      </main>
      <Footer />
    </>
  );
}
