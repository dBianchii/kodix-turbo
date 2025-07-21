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
            <Container className="mx-auto my-[40px] w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
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
                <Text className="mb-8 font-medium text-[14px] text-black leading-[24px]">
                  {t(
                    "api.emails.Click the following link to reset your password"
                  )}
                </Text>

                <Text className="font-medium text-[14px] text-black leading-[24px]">
                  <Link
                    className="text-[#2754C5] underline"
                    href={`${getBaseUrl()}/signin/reset-password?token=${token}`}
                    target="_blank"
                  >
                    {t("api.emails.Reset your password")}
                  </Link>
                </Text>
              </Section>

              <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />

              <Text className="flex items-center justify-center text-[12px] text-[rgb(102,102,102)] leading-[24px]">
                © 2024 Kodix. All rights reserved.
              </Text>
            </Container>
          </Body>
        </Fragment>
      </Tailwind>
    </Html>
  );
}
