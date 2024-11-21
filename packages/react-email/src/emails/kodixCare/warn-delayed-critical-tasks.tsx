import { Body, Head, Html, Preview, Tailwind } from "@react-email/components";

import type { IsomorficT } from "@kdx/locales";

import type { TMock } from "../../utils";
import { tMock } from "../../utils";

export default function WarnDelayedCriticalTasks({
  taskTitle = "Comer macarrão",
  // taskDate = new Date(),
  t = tMock,
}: {
  t: IsomorficT | TMock;
  taskTitle: string | null;
  // taskDate: Date;
}) {
  return (
    <Html>
      <Head />
      <Preview>{`A tarefa ${taskTitle} está atrasada`}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          {taskTitle ?? t("api.emails.no title")}
        </Body>
      </Tailwind>
    </Html>
  );
}
