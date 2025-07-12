import { useEffect } from "react";
import { Keyboard, TouchableOpacity } from "react-native";
import { Link, Stack, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import {
  Button,
  H3,
  Input,
  Paragraph,
  Spinner,
  Text,
  useTheme,
  View,
  YStack,
} from "tamagui";

import { ZCheckEmailForRegisterInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import { DismissKeyboard } from "~/components/dismiss-keyboard";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "~/components/form";
import { api } from "~/utils/api";

export default function Register() {
  const router = useRouter();
  const utils = api.useUtils();

  useEffect(() => {
    void utils.app.kodixCare.checkEmailForRegister.reset();
  }, [utils]);

  const form = useForm({
    schema: ZCheckEmailForRegisterInputSchema,
  });

  const query = api.app.kodixCare.checkEmailForRegister.useQuery(
    {
      email: form.watch("email"),
    },
    {
      enabled: false,
    },
  );

  const theme = useTheme();

  return (
    <DismissKeyboard>
      <YStack bg={"$background"} flex={1} px={"$4"}>
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: theme.background.val,
            },
            title: "",
            headerShown: true,
            headerShadowVisible: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  router.back();
                }}
              >
                <ChevronLeft size={"$2"} />
              </TouchableOpacity>
            ),
          }}
        />
        <YStack>
          <H3 alignSelf="center">Digite seu email</H3>
          <Paragraph mt={"$3"}>
            Se você já recebeu um convite para o KodixCare, digite seu email
            para continuar
          </Paragraph>
        </YStack>
        <YStack mt={"$4"}>
          <Form {...form}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="name@email.com"
                      onChangeText={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!query.data ? (
              <Button
                mt={"$6"}
                onPress={form.handleSubmit(async (values) => {
                  Keyboard.dismiss();
                  const result = await query.refetch();

                  if (result.data?.status === "invited") {
                    //Navigate to the next step
                    void router.push(
                      `/register/step2/?email=${values.email}&inviteId=${result.data.inviteId}`,
                    );
                  }
                })}
              >
                {query.isFetching ? <Spinner /> : "Continuar"}
              </Button>
            ) : null}
          </Form>
        </YStack>
        <View mt={"$6"} ai={"center"}>
          {!query.data && query.isError && (
            <Text color="red">
              Ocorreu um erro ao verificar o email. Tente novamente.
            </Text>
          )}
          {query.data?.status === "not invited" && (
            <Text color="red">
              Parece que você não possui um convite ainda. Peça um convite para
              um cuidador para continuar.
            </Text>
          )}
          {query.data?.status === "already registered" && (
            <>
              <Text color="red" mb={"$3"}>
                Email já cadastrado. Faça login para continuar.
              </Text>
              <Link href="/signIn" asChild replace>
                <Button variant="outlined">
                  Entrar <ChevronRight />
                </Button>
              </Link>
            </>
          )}
        </View>
      </YStack>
    </DismissKeyboard>
  );
}
