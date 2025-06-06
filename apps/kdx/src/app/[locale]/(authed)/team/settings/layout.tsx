import { getLocale, getTranslations } from "next-intl/server";
import { LuChevronRight } from "react-icons/lu";

import { auth } from "@kdx/auth";

import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { Navigation } from "~/app/[locale]/_components/navigation";
import { redirect } from "~/i18n/routing";
import { trpcCaller } from "~/trpc/server";
import { ShouldRender } from "./general/_components/client-should-render";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await auth();
  if (!user) return redirect({ href: "/", locale: await getLocale() });

  const team = await trpcCaller.team.getActiveTeam();
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
          <LuChevronRight />
          <p className="text-muted-foreground text-base">
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
