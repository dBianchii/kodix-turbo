import * as React from "react";
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

import { getI18n } from "@kdx/locales/server";
import { getBaseUrl } from "@kdx/shared";

export default async function ResetPassword({ token }: { token: string }) {
  const t = await getI18n();

  return (
    <Html>
      <Head />
      <Preview>{t("Reset your password")}</Preview>
      <Tailwind>
        <React.Fragment>
          <Body className="mx-auto my-auto bg-white font-sans">
            <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
              <Section className="mt-[32px] text-center">
                <Text className="text-bold text-balance  bg-gradient-to-br from-black from-30% to-black/80 bg-clip-text text-xl font-semibold leading-none tracking-tighter ">
                  Kodix
                </Text>
              </Section>

              <Section className="mb-[32px] mt-[32px] text-center">
                <Text className="mb-8 text-[14px] font-medium leading-[24px] text-black">
                  {t("Click the following link to reset your password")}
                </Text>

                <Text className="text-[14px] font-medium leading-[24px] text-black">
                  <Link
                    href={`${getBaseUrl()}/signin/reset-password?token=${token}`}
                    target="_blank"
                    className="text-[#2754C5] underline"
                  >
                    {t("Reset Password")}
                  </Link>
                </Text>
              </Section>

              <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

              <Text className="flex items-center justify-center text-[12px] leading-[24px] text-[rgb(102,102,102)]">
                © 2024 Kodix. {t("All rights reserved")}
              </Text>
            </Container>
          </Body>
        </React.Fragment>
      </Tailwind>
    </Html>
  );
}
