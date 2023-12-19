import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { Navigation } from "~/app/_components/navigation";
import { ShouldRender } from "~/app/team/settings/general/_components/client-should-render";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navItems = [
    {
      href: `/account/general`,
      title: "General",
    },
    {
      href: `/account/teams`,
      title: "Teams",
    },
  ];

  return (
    <main className="flex-1 py-8">
      <MaxWidthWrapper>
        <div className="flex flex-col justify-center border-b pb-8">
          <h1 className="text-4xl font-bold">Account Settings</h1>
        </div>
        <div className="mt-8 flex flex-col md:flex-row md:space-x-6">
          <Navigation
            items={navItems}
            goBackItem={{
              href: "/account",
              title: "Account settings",
            }}
          />
          <ShouldRender endsWith="/account">{children}</ShouldRender>
        </div>
      </MaxWidthWrapper>
    </main>
  );
}
