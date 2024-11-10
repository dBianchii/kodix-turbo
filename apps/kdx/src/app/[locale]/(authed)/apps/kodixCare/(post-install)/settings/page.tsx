import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { kodixCareAppId } from "@kdx/shared";

import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { api } from "~/trpc/server";
import { KodixCareUserSettingsForm } from "./_components/kodix-care-user-settings-form";

export default async function KodixCareSettingsPage() {
  const t = await getTranslations();
  await redirectIfAppNotInstalled({
    appId: kodixCareAppId,
    customRedirect: "/apps/kodixCare/onboarding",
  });

  return (
    <main className="pt-6 md:p-6">
      <h2 className="mb-4 text-lg font-medium">{t("Settings")}</h2>
      {/* <Tabs defaultValue="account" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="account"></TabsContent>
      </Tabs> */}
      <Suspense>
        <KodixCareUserSettingsFormServer />
      </Suspense>
    </main>
  );
}

async function KodixCareUserSettingsFormServer() {
  const config = await api.app.getUserAppTeamConfig({
    appId: kodixCareAppId,
  });

  return <KodixCareUserSettingsForm config={config} />;
}
