import { getBaseUrl } from "@kodix/shared/utils";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export const CashWelcome = ({
  username = "Usuário",
  cashbackAmount = "5,00",
  registerUrl = `${getBaseUrl()}/cadastro`,
}: {
  username: string;
  cashbackAmount: string;
  registerUrl: string;
}) => (
  <Html>
    <Head />
    <Preview>{`Bem-vindo ao Despertar! Você ganhou R$ ${cashbackAmount} de cashback`}</Preview>
    <Tailwind>
      <Body className="mx-auto my-auto bg-primary-foreground bg-white font-sans">
        <Container className="mx-auto my-10 max-w-md rounded border border-[#eaeaea] border-solid p-5">
          <Section className="mt-8">
            <Img
              alt="Despertar"
              className="mx-auto my-0 w-40"
              src={`${getBaseUrl()}/emails/despertar-logo.png`}
            />
          </Section>
          <Heading className="mx-0 my-8 p-0 text-center font-normal text-2xl text-black">
            Bem-vindo ao <strong className="text-[#F5931A]">Despertar</strong>!
          </Heading>
          <Text className="text-black text-sm leading-6">
            Olá <strong>{username}</strong>,
          </Text>
          <Text className="text-black text-sm leading-6">
            Temos uma ótima notícia para você! 🎉
          </Text>
          <Section className="my-8 rounded-md bg-[#FFF4E6] p-6 text-center">
            <Text className="m-0 mb-2 text-[#666666] text-sm">Você possui</Text>
            <Text className="m-0 font-bold text-4xl text-[#F5931A] leading-tight">
              R$ {cashbackAmount}
            </Text>
            <Text className="m-0 mt-2 text-[#666666] text-sm">de cashback</Text>
          </Section>
          <Text className="text-black text-sm leading-6">
            Para receber seu cashback, clique no botão abaixo
          </Text>
          <Section className="my-8 text-center">
            <Button
              className="rounded bg-[#F5931A] px-8 py-4 text-center font-semibold text-sm text-white no-underline"
              href={registerUrl}
            >
              Criar minha conta e receber cashback
            </Button>
          </Section>
          <Text className="text-black text-sm leading-6">
            Ou copie e cole este link no seu navegador:{" "}
            <Link className="text-[#F5931A] no-underline" href={registerUrl}>
              {registerUrl}
            </Link>
          </Text>
          <Hr className="mx-0 my-7 w-full border border-[#eaeaea] border-solid" />
          <Text className="text-[#666666] text-xs leading-6">
            Este e-mail foi enviado para{" "}
            <span className="text-black">{username}</span>. Se você não esperava
            receber este e-mail, pode ignorá-lo.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default CashWelcome;
