import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { LuCirclePlus } from "react-icons/lu";

import { auth } from "@kdx/auth";

import { KodixApp } from "~/app/[locale]/_components/app/kodix-app";
import { KodixAppSkeleton } from "~/app/[locale]/_components/app/kodix-app-skeleton";
import { Link, redirect } from "~/i18n/routing";
import { trpcCaller } from "~/trpc/server";

export default async function SettingsAppsPage() {
  const { user } = await auth();
  if (!user) redirect({ href: "/", locale: await getLocale() });
  const t = await getTranslations();
  return (
    <div className="mt-8 space-y-6 md:mt-0">
      <div>
        <h2 className="text-center text-2xl font-bold md:text-left">
          {t("Apps")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("settings.Manage your apps")}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Suspense
          fallback={Array.from({ length: 3 }).map((_, i) => (
            <KodixAppSkeleton key={i} />
          ))}
        >
          <Apps />
        </Suspense>
      </div>
    </div>
  );
}

async function Apps() {
  const apps = await trpcCaller.app.getInstalled();
  const { user } = await auth();
  const t = await getTranslations();

  if (!apps.length)
    return (
      <Link href={"/apps"}>
        <div className="group flex h-64 flex-col rounded-xl outline-dashed outline-2 outline-muted-foreground/50">
          <div className="mx-auto my-auto flex flex-col items-center justify-center">
            <LuCirclePlus
              className="text-muted-foreground/80 transition-all group-hover:translate-y-[-4px] group-hover:text-muted-foreground"
              size={32}
            />
            <p className="font-medium text-muted-foreground/80">
              {t("Add more apps")}
            </p>
          </div>
        </div>
      </Link>
    );

  return apps.map((app) => (
    <KodixApp id={app.id} installed={true} user={user} key={app.id} />
  ));
}
