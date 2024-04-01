import { Suspense } from "react";

import { db } from "@kdx/db";

export default async function CupomPage() {
  return (
    <div>
      <h1>Cupom</h1>
      <Suspense fallback={<div>loading...</div>}>
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
