import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

export default async function CupomPage() {
  const t = await getTranslations();

  return (
    <div>
      <h1>{t("apps.cupom.Cupom")}</h1>
      <Suspense fallback={<div>{t("Loading")}...</div>}>
        {/* <Usuarios /> */}
      </Suspense>
    </div>
  );
}
