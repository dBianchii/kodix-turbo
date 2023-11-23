import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { Navigation } from "~/app/_components/navigation";
import { ShouldRender } from "~/app/workspace/[url]/settings/general/_components/client-should-render";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navItems = [
    {
      href: `/account/general`,
      title: "General",
    },
    {
      href: `/account/workspaces`,
      title: "Workspaces",
    },
  ];

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col justify-center border-b pb-8">
        <h1 className="text-4xl font-bold">Settings</h1>
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
  );
}
