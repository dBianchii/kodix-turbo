import { RxChevronRight } from "react-icons/rx";

import { auth } from "@kdx/auth";
import { redirect } from "@kdx/locales/next-intl/navigation";
import { getTranslations } from "@kdx/locales/next-intl/server";

import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { Navigation } from "~/app/[locale]/_components/navigation";
import { api } from "~/trpc/server";
import { ShouldRender } from "./general/_components/client-should-render";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await auth();
  if (!user) return redirect("/");
  const team = await api.team.getActiveTeam();
  const t = await getTranslations();

  const navItems = [
    {
      href: `/team/settings/general`,
      title: t("General"),
    },
    {
      href: `/team/settings/apps`,
      title: t("Apps"),
    },
    {
      href: `/team/settings/members`,
      title: t("Members"),
    },
    {
      href: "/team/settings/permissions",
      title: t("Permissions"),
      shown: user.id === team.ownerId,
    },
  ];

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col justify-center border-b pb-4">
        <h1 className="text-lg font-bold">{t("Team Settings")}</h1>
        <div className="flex items-center">
          <RxChevronRight />
          <p className="text-base text-muted-foreground">
            {user.activeTeamName}
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col md:flex-row md:space-x-6">
        <Navigation
          items={navItems}
          goBackItem={{
            title: t("Settings"),
            href: `/team/settings`,
          }}
        />
        <ShouldRender endsWith="/settings">{children}</ShouldRender>
      </div>
    </MaxWidthWrapper>
  );
}
