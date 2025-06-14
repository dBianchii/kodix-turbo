"use client";

import { use } from "react";

import type { RouterOutputs } from "@kdx/api";
import type { auth } from "@kdx/auth";
import type { KodixAppId } from "@kdx/shared";

import { KodixApp } from "~/app/[locale]/_components/app/kodix-app";

export function KodixApps({
  appsPromise,
  authPromise,
}: {
  appsPromise: Promise<RouterOutputs["app"]["getAll"]>;
  authPromise: ReturnType<typeof auth>;
}) {
  const apps = use(appsPromise);
  const { user } = use(authPromise);

  return apps.map((app) => (
    <div key={app.id}>
      <KodixApp
        id={app.id as KodixAppId}
        installed={app.installed}
        user={user}
      />
    </div>
  ));
}
