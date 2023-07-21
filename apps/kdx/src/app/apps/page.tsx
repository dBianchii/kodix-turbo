"use client";

import { useEffect } from "react";

import { H1, H4, Lead } from "@kdx/ui";

import { api } from "~/utils/api";
import KodixApp from "~/components/App/KodixApp";

export default function Apps() {
  const { data: apps } = api.app.getInstalled.useQuery();

  useEffect(() => void {}, [apps]);

  return (
    <div className="p-4">
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
    </div>
  );
}
