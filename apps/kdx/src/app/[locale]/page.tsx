import Link from "next/link";
import { redirect } from "next/navigation";
import { RxChevronRight } from "react-icons/rx";

import { auth } from "@kdx/auth";
import { getI18n, setStaticParamsLocale } from "@kdx/locales/server";
import { cn } from "@kdx/ui";
import { buttonVariants } from "@kdx/ui/button";

import { BentoDemo } from "./_components/bento-grid";
import { Footer } from "./_components/footer";

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setStaticParamsLocale(locale);

  const session = await auth();
  if (session) redirect("/team");
  const t = await getI18n();

  return (
    <>
      <main className="flex-1">
        <section id="hero">
          <div className="relative h-full overflow-hidden py-8">
            <div className="container z-10 flex flex-col">
              <div className="mt-20 grid grid-cols-1">
                <div className="flex flex-col items-center gap-6 pb-8 text-center">
                  <h1 className="text-balance bg-gradient-to-br from-black from-30% to-black/60 bg-clip-text py-6 text-5xl font-semibold leading-none tracking-tighter text-transparent dark:from-white dark:to-white/40 sm:text-6xl md:text-7xl lg:text-7xl">
                    {t("home.title")}
                  </h1>
                  <p className="max-w-[64rem] text-balance text-lg tracking-tight text-gray-500 md:text-xl">
                    {t("home.description")}
                  </p>
                  <div className="flex flex-col gap-4 lg:flex-row">
                    <Link
                      href="/components"
                      className={cn(
                        buttonVariants({
                          variant: "default",
                          size: "lg",
                        }),
                        "gap-2 whitespace-pre md:flex",
                        "group relative w-full gap-1 overflow-hidden rounded-full text-sm font-semibold tracking-tighter",
                      )}
                    >
                      Browse Components
                      <RxChevronRight className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/docs"
                      className={cn(
                        buttonVariants({
                          size: "lg",
                          variant: "ghost",
                        }),
                        "gap-2 whitespace-pre md:flex",
                        "group relative w-full gap-1 overflow-hidden rounded-full text-sm font-semibold tracking-tighter",
                      )}
                    >
                      Get Started
                      <RxChevronRight className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="px-8">
          <BentoDemo />
        </section>
      </main>
      <Footer />
    </>
  );
}
