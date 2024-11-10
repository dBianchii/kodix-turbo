import { Body, Head, Html, Preview, Tailwind } from "@react-email/components";

import type { IsomorficT } from "@kdx/locales";

export default function WarnDelayedCriticalTasks({
  task,
  t,
}: {
  t: IsomorficT;
  task: {
    title: string | null;
    date: Date;
  };
}) {
  return (
    <Html>
      <Head />
      <Preview>{`A tarefa ${task.title} está atrasada`}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          {task.title ?? t("api.emails.no title")}
        </Body>
      </Tailwind>
    </Html>
  );
}
