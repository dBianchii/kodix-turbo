import { auth } from "@kdx/auth";
import type { KodixAppName } from "@kdx/db";
import { H1, Lead } from "@kdx/ui";

import { KodixApp } from "~/app/_components/app/kodix-app";
import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { api } from "~/trpc/server";

export default async function Apps() {
  const apps = await api.app.getAll.query();
  const session = await auth();

  apps.sort((a, b) => {
    if (a.name === "Kodix Care") return 1;
    if (b.name === "Kodix Care") return -1;

    return 0;
  });

  return (
    <MaxWidthWrapper>
      <H1>Marketplace</H1>
      <Lead className="mt-2">
        Take a look at all available apps, and install them
      </Lead>
      <br />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {apps?.map((app) => (
          <div key={app.id}>
            <KodixApp
              id={app.id}
              appName={app.name as KodixAppName}
              appDescription={app.description}
              appUrl={app.url}
              installed={app.installed}
              session={session}
            />
          </div>
        ))}
      </div>
    </MaxWidthWrapper>
  );
}
