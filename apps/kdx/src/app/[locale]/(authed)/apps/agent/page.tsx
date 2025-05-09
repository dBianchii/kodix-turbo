import { getTranslations } from "next-intl/server";

import type { KodixAppId } from "@kdx/shared";
import { agentAppId } from "@kdx/shared";
import { Separator } from "@kdx/ui/separator";
import { H1 } from "@kdx/ui/typography";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import AgentLayout from "./_components/agent-layout";

export default async function AgentPage() {
  const appId = agentAppId as unknown as KodixAppId;
  await redirectIfAppNotInstalled({ appId });
  const t = await getTranslations();

  return (
    <MaxWidthWrapper>
      <main className="pt-6">
        <div className="flex items-center space-x-4">
          <IconKodixApp appId={appId} renderText={false} />
          <H1>{t("Agent")}</H1>
        </div>
        <Separator className="my-4" />
        <AgentLayout />
      </main>
    </MaxWidthWrapper>
  );
}
