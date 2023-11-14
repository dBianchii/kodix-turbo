import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";
import { H1, Lead } from "@kdx/ui";

import { KodixApp } from "~/app/components/app/kodix-app";
import MaxWidthWrapper from "~/app/components/max-width-wrapper";

export default async function Apps() {
  const session = await auth();
  if (!session) return redirect("/api/auth/signin?callbackUrl=/apps");
  const apps = await prisma.app.findMany({
    include: {
      activeWorkspaces: {
        where: {
          id: session.user.activeWorkspaceId,
        },
      },
    },
  });

  return (
    <MaxWidthWrapper>
      <H1>Your installed apps</H1>
      <Lead className="mt-2">These are your installed apps</Lead>
      <br />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {apps?.map((app) => (
          <div key={app.id}>
            <KodixApp
              id={app.id}
              appName={app.name}
              appDescription={app.description}
              appUrl={app.urlApp}
              installed={true}
            />
          </div>
        ))}
      </div>
    </MaxWidthWrapper>
  );
}
