"use client";

import { use } from "react";

import type { RouterOutputs } from "@kdx/api";

export function DataTableKodixCareLogs({
  appActivityLogsPromise,
}: {
  appActivityLogsPromise: Promise<RouterOutputs["app"]["getAppActivity"]>;
}) {
  const _data = use(appActivityLogsPromise);

  return <></>;
}
