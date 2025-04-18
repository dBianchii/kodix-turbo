import { Fragment } from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import type { IsomorficT } from "@kdx/locales";
import { getBaseUrl } from "@kdx/shared";

import type { TMock } from "./utils";
import { tMock } from "./utils";

export default function ResetPassword({
  token,
  t = tMock,
}: {
  token: string;
  t: IsomorficT | TMock;
}) {
  return (
    <Html>
      <Head />
      <Preview>{t("api.emails.Reset your password")}</Preview>
      <Tailwind>
        <Fragment>
          <Body className="mx-auto my-auto bg-white font-sans">
            <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
              {/* <Section className="mt-[32px]">
                <Img
                  src={`${getBaseUrl()}/group.jpeg`}
                  width="160"
                  height="48"
                  alt="StarterKit"
                  className="mx-auto my-0"
                />
              </Section> */}

              <Section className="mt-[32px] mb-[32px] text-center">
                <Text className="mb-8 text-[14px] leading-[24px] font-medium text-black">
                  {t(
                    "api.emails.Click the following link to reset your password",
                  )}
                </Text>

                <Text className="text-[14px] leading-[24px] font-medium text-black">
                  <Link
                    href={`${getBaseUrl()}/signin/reset-password?token=${token}`}
                    target="_blank"
                    className="text-[#2754C5] underline"
                  >
                    {t("api.emails.Reset your password")}
                  </Link>
                </Text>
              </Section>

              <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

              <Text className="flex items-center justify-center text-[12px] leading-[24px] text-[rgb(102,102,102)]">
                © 2024 Kodix. All rights reserved.
              </Text>
            </Container>
          </Body>
        </Fragment>
      </Tailwind>
    </Html>
  );
}
