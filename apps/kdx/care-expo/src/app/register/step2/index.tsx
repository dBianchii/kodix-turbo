import { Keyboard } from "react-native";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Button, H3, Input, Paragraph, Spinner, View, YStack } from "tamagui";

import { ZSignupWithPasswordInputSchema } from "@kdx/validators/trpc/user";

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
import { RootSafeAreaView } from "~/components/safe-area-view";
import { api } from "~/utils/api";
import { setToken } from "~/utils/session-store";

export default function RegisterStep2() {
  const { email, inviteId } = useLocalSearchParams();
  if (typeof email !== "string" || typeof inviteId !== "string")
    throw new Error("Invalid email or inviteId");

  const utils = api.useUtils();

  const mutation = api.user.signupWithPassword.useMutation({
    onSuccess: async (sessionToken) => {
      setToken(sessionToken);
      await utils.invalidate();
      router.dismissAll();
    },
  });
  const form = useForm({
    schema: ZSignupWithPasswordInputSchema.omit({
      invite: true,
    }),
    defaultValues: {
      email,
    },
  });

  return (
    <RootSafeAreaView>
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
          <H3 alignSelf="center">Encontramos seu convite</H3>
          <Paragraph mt={"$3"} alignSelf="center">
            Agora, precisamos de algumas informações
          </Paragraph>
        </YStack>
        <YStack mt={"$2"}>
          <Form {...form}>
            <View gap={"$1"}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Joana da Silva"
                        onChangeText={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      Você poderá alterar seu nome depois a qualquer momento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        opacity={0.5}
                        {...field}
                        placeholder="name@email.com"
                        onChangeText={field.onChange}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        secureTextEntry
                        onChangeText={field.onChange}
                        value={field.value}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                mt={"$4"}
                onPress={form.handleSubmit((values) => {
                  Keyboard.dismiss();
                  mutation.mutate({
                    email: values.email,
                    password: values.password,
                    name: values.name,
                    invite: inviteId,
                  });
                })}
              >
                {mutation.isPending ? <Spinner /> : "Continuar"}
              </Button>
            </View>
          </Form>
        </YStack>
      </YStack>
    </RootSafeAreaView>
  );
}
