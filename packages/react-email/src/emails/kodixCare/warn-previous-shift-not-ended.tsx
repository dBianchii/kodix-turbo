import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export default function WarnPreviousShiftNotEnded() {
  return (
    <Html>
      <Head />
      <Preview>{"asd"}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src={``}
                width="40"
                height="37"
                alt="Kodix"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Kodix Care
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hello user, this is a reminder related to your previous shift,
              which has not ended. Please, do your best to end it as soon as
              possible
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
