import { Body, Head, Html, Preview, Tailwind } from "@react-email/components";

import type { locales } from "@kdx/locales";
import { defaultLocale } from "@kdx/locales";
import { getTranslations } from "@kdx/locales/next-intl/server";

export default async function WarnDelayedCriticalTasks({
  task,
  locale = defaultLocale,
}: {
  locale: (typeof locales)[number];
  task: {
    title: string | null;
    date: Date;
  };
}) {
  const t = await getTranslations({ locale });

  return (
    <Html>
      <Head />
      <Preview>{"asd"}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          {task.title ?? t("api.emails.no title")}
        </Body>
      </Tailwind>
    </Html>
  );
}
