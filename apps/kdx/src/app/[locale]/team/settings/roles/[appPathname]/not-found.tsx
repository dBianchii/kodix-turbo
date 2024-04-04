import { getI18n } from "@kdx/locales/server";

export default async function NotFound() {
  const t = await getI18n();
  return <p className="text-muted-foreground">{t("Not found")}</p>;
}
