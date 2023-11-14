import { H1, Lead } from "@kdx/ui";

import { KodixApp } from "~/app/components/app/kodix-app";
import MaxWidthWrapper from "~/app/components/max-width-wrapper";
import { api } from "~/trpc/server";

export default async function Apps() {
  const apps = await api.app.getAll.query();

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
              appName={app.name}
              appDescription={app.description}
              appUrl={app.urlApp}
              installed={app.installed}
            />
          </div>
        ))}
      </div>
    </MaxWidthWrapper>
  );
}
