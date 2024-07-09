import React, { useEffect } from "react";
import { Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "@tamagui/lucide-icons";
import {
  Button,
  H3,
  Input,
  Paragraph,
  Spinner,
  Text,
  View,
  YStack,
} from "tamagui";
import { z } from "zod";

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
    schema: z.object({
      email: z.string().email(),
    }),
  });

  const query = api.app.kodixCare.checkEmailForRegister.useQuery(
    {
      email: form.watch("email"),
    },
    {
      enabled: false,
    },
  );

  return (
    <DismissKeyboard>
      <YStack bg={"$background"} flex={1} alignItems="center" px={"$3"}>
        <SafeAreaView>
          <Button
            onPress={() => {
              router.back();
            }}
            unstyled
            scaleIcon={2}
            icon={<ArrowLeft />}
          />
          <YStack>
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

                <Button
                  mt={"$6"}
                  onPress={form.handleSubmit(async (values) => {
                    console.log("here");
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
                  Parece que você não possui um convite ainda. Peça um convite
                  para um cuidador para continuar.
                </Text>
              )}
              {query.data?.status === "already registered" && (
                <Text color="red">
                  Email já cadastrado. Faça login para continuar.
                </Text>
              )}
            </View>
          </YStack>
        </SafeAreaView>
      </YStack>
    </DismissKeyboard>
  );
}
