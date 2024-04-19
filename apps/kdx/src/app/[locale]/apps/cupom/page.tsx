import { Suspense } from "react";

import { db } from "@kdx/db";
import { getI18n } from "@kdx/locales/server";

import { api } from "~/trpc/react";

export default async function CupomPage() {
  const t = await getI18n();

  const { data } = api.auth.getSession.useQuery();

  return (
    <div>
      <h1>{t("apps.cupom.Cupom")}</h1>
      <Suspense fallback={<div>{t("Loading")}...</div>}>
        <Usuarios />
      </Suspense>
    </div>
  );
}

async function Usuarios() {
  const users = await db.query.users.findMany();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return <div>{JSON.stringify(users)}</div>;
}
