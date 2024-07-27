import { Suspense } from "react";
import Link from "next/link";
import { RxPlusCircled } from "react-icons/rx";

import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";
import { redirect } from "@kdx/locales/navigation";
import { getTranslations } from "@kdx/locales/server";

import { KodixApp } from "~/app/[locale]/_components/app/kodix-app";
import { KodixAppSkeleton } from "~/app/[locale]/_components/app/kodix-app-skeleton";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { api } from "~/trpc/server";

export default async function SettingsAppsPage() {
  const { user } = await auth();
  if (!user) redirect("/");
  const t = await getTranslations();
  return (
    <MaxWidthWrapper>
      <h1 className="text-lg font-bold text-foreground">
        {t("Your installed apps")}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {t("settings.These are your installed apps")}
      </p>
      <br />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Suspense
          fallback={Array.from({ length: 3 }).map((_, i) => (
            <KodixAppSkeleton key={i} />
          ))}
        >
          <Apps />
        </Suspense>
      </div>
    </MaxWidthWrapper>
  );
}

async function Apps() {
  const apps = await api.app.getInstalled();
  const { user } = await auth();
  const t = await getTranslations();

  if (!apps.length)
    return (
      <Link href={"/apps"}>
        <div className="group flex h-64 flex-col rounded-xl outline-dashed outline-2 outline-muted-foreground/50">
          <div className="mx-auto my-auto flex flex-col items-center justify-center">
            <RxPlusCircled
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
    <KodixApp
      id={app.id as KodixAppId}
      installed={true}
      user={user}
      key={app.id}
    />
  ));
}
