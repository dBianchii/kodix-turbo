import { redirect } from "next/navigation";
import { RxChevronRight } from "react-icons/rx";

import { auth } from "@kdx/auth";

import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { Navigation } from "~/app/_components/navigation";
import { ShouldRender } from "./general/_components/client-should-render";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) return redirect("/signin");

  const navItems = [
    {
      href: `/team/settings/apps`,
      title: `Apps`,
    },
    {
      href: `/team/settings/general`,
      title: "General",
    },
    {
      href: `/team/settings/members`,
      title: "Members",
    },
  ];

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col justify-center border-b pb-4">
        <h1 className="text-lg font-bold">Team Settings</h1>
        <div className="flex items-center">
          <RxChevronRight />
          <p className="text-base text-muted-foreground">
            {session.user.activeTeamName}
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col md:flex-row md:space-x-6">
        <Navigation
          items={navItems}
          goBackItem={{
            title: "Settings",
            href: `/team/settings`,
          }}
        />
        <ShouldRender endsWith="/settings">{children}</ShouldRender>
      </div>
    </MaxWidthWrapper>
  );
}
