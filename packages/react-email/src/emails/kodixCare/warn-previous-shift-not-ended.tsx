import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";

import type { IsomorficT } from "@kdx/locales";

import type { TMock } from "../../utils";
import { tMock } from "../../utils";

export default function WarnPreviousShiftNotEnded({
  personWhoEndedShiftName,
  t = tMock,
}: {
  personWhoEndedShiftName: string;
  t: IsomorficT | TMock;
}) {
  return (
    <Html>
      <Head />
      <Preview>
        {t(`api.Your last shift was ended by NAME`, {
          name: personWhoEndedShiftName,
        })}
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            {/* <Section className="mt-[32px]">
              <Img
                src={``}
                width="40"
                height="37"
                alt="Kodix"
                className="mx-auto my-0"
              />
            </Section> */}
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Kodix Care
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              {t(`api.Your last shift was ended by NAME`, {
                name: personWhoEndedShiftName,
              })}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
