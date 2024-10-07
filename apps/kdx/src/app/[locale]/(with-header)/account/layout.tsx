import { getTranslations } from "@kdx/locales/next-intl/server";

import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { Navigation } from "~/app/[locale]/_components/navigation";
import { ShouldRender } from "../team/settings/general/_components/client-should-render";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations();
  const navItems = [
    {
      href: `/account/general`,
      title: t("General"),
    },
  ];

  return (
    <main className="flex-1 py-8">
      <MaxWidthWrapper>
        <div className="flex flex-col justify-center border-b pb-8">
          <h1 className="text-4xl font-bold">
            {t("account.Account settings")}
          </h1>
        </div>
        <div className="mt-8 flex flex-col md:flex-row md:space-x-6">
          <Navigation
            items={navItems}
            goBackItem={{
              href: "/account",
              title: t("account.Account settings"),
            }}
          />
          <ShouldRender endsWith="/account">{children}</ShouldRender>
        </div>
      </MaxWidthWrapper>
    </main>
  );
}
