import { getI18n } from "@kdx/locales/server";

export default async function InviteNotFound() {
  const t = await getI18n();
  return (
    <section className="flex min-h-screen flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold">{t("Not found")}</h1>
      <p className="text-center">
        {t("This invitation no longer exists or is invalid")}
      </p>
    </section>
  );
}
