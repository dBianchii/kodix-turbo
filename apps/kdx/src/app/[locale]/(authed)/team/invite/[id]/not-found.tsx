import { getTranslations } from "next-intl/server";

export default async function InviteNotFound() {
  const t = await getTranslations();
  return (
    <section className="flex min-h-screen flex-col items-center justify-center space-y-8">
      <h1 className="font-bold text-4xl">{t("Not found")}</h1>
      <p className="text-center">
        {t("This invitation no longer exists or is invalid")}
      </p>
    </section>
  );
}
