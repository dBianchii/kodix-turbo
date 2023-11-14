import { notFound, redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";

import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { api } from "~/trpc/server";
import { SettingsNavigation } from "./_components/settings-nav";
import { ShouldRender } from "./general/_components/client-should-render";

export default async function Layout({
  params,
  children,
}: {
  params: { url: string };
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) return redirect("/signin");
  const searchedWs = await prisma.workspace.findFirst({
    where: {
      url: params.url,
    },
    select: {
      id: true,
      url: true,
      users: {
        where: {
          id: session?.user.id,
        },
        select: {
          workspaces: {
            select: {
              url: true,
            },
          },
        },
      },
    },
  });

  const workspaceIsFromUser = searchedWs?.users[0]?.workspaces.some(
    (x) => x.url === params.url,
  );

  if (!searchedWs || !workspaceIsFromUser) notFound();

  const searchedWorkspaceIsActiveWs =
    searchedWs?.id === session?.user.activeWorkspaceId;

  if (!searchedWorkspaceIsActiveWs) {
    await api.user.switchActiveWorkspace.mutate({
      workspaceId: searchedWs?.id,
    });
  }

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col justify-center border-b pb-8">
        <h1 className="text-4xl font-bold">Settings</h1>
      </div>
      <div className="mt-8 flex flex-col md:flex-row md:space-x-6">
        <SettingsNavigation url={params.url} />
        <ShouldRender>{children}</ShouldRender>
      </div>
    </MaxWidthWrapper>
  );
}
