import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations();
  return <p className="text-muted-foreground">{t("Not found")}</p>;
}
