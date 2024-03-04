import { redirect } from "next/navigation";

import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";

import { KodixApp } from "~/app/_components/app/kodix-app";
import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { api } from "~/trpc/server";

export default async function AppsPage() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");
  const apps = await api.app.getInstalled();

  return (
    <MaxWidthWrapper>
      <h1 className="text-lg font-bold text-foreground">Your installed apps</h1>
      <p className="mt-2 text-muted-foreground">
        These are your installed apps
      </p>
      <br />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {apps?.map((app) => (
          <div key={app.id}>
            <KodixApp
              id={app.id as KodixAppId}
              installed={true}
              session={session}
            />
          </div>
        ))}
      </div>
    </MaxWidthWrapper>
  );
}
