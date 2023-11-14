import { unstable_cache } from "next/cache";

import type { RouterOutputs } from "@kdx/api";
import { auth } from "@kdx/auth";

import { KodixApp } from "~/app/components/app/kodix-app";
import { api } from "~/trpc/server";
import { GradientHero } from "./gradient-hero";

export default async function Home() {
  const session = await auth();

  let initialData: RouterOutputs["app"]["getAll"] | undefined;
  if (session) {
    const getApps = unstable_cache(
      async () => await api.app.getAll.query(),
      ["apps"],
      {
        tags: ["apps"],
      },
    )();

    initialData = await getApps;
  }

  return (
    <div className="h-144 flex min-h-screen flex-col items-center gap-12 px-4 py-16">
      <h1 className="text-primary scroll-m-20 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent lg:text-8xl">
        Welcome to Kodix
      </h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {initialData?.map((app) => (
          <div key={app.id}>
            <KodixApp
              id={app.id}
              appName={app.name}
              appDescription={app.description}
              appUrl={app.urlApp}
              installed={app.installed}
            />
          </div>
        ))}
      </div>
      <GradientHero />
    </div>
  );
}
