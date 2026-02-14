import { useEffect } from "react";
import { Keyboard, TouchableOpacity } from "react-native";
import { Button } from "@tamagui/button";
import { Text, useTheme, View } from "@tamagui/core";
import { Input } from "@tamagui/input";
import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import { YStack } from "@tamagui/stacks";
import { H3, Paragraph } from "@tamagui/text";
import { Link, Stack, useRouter } from "expo-router";

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
import { Spinner } from "~/components/spinner";
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
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  router.back();
                }}
              >
                <ChevronLeft size={"$2"} />
              </TouchableOpacity>
            ),
            headerShadowVisible: false,
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.background.val,
            },
            title: "",
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
                      onChangeText={field.onChange}
                      placeholder="name@email.com"
                    />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {query.data ? null : (
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
            )}
          </Form>
        </YStack>
        <View ai={"center"} mt={"$6"}>
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
              <Link asChild href="/signIn" replace>
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
