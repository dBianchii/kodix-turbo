import { Pressable } from "react-native";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { Stack, useRouter } from "expo-router";
import { Input, SizableText, Spinner, useTheme, View } from "tamagui";
import { useTranslations } from "use-intl";

import { ZChangeNameInputSchema } from "@kdx/validators/trpc/user";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "~/components/form";
import { defaultPadding } from "~/components/safe-area-view";
import { api } from "~/utils/api";
import { useAuth } from "~/utils/auth";

export default function EditNamePage() {
  const { user } = useAuth();

  const t = useTranslations();
  const form = useForm({
    defaultValues: {
      name: user?.name ?? undefined,
    },
    schema: ZChangeNameInputSchema(t),
  });

  const router = useRouter();

  const utils = api.useUtils();
  const mutation = api.user.changeName.useMutation({
    onSuccess: async () => {
      await utils.auth.invalidate();
      router.back();
    },
  });

  const theme = useTheme();
  if (!user) {
    router.replace("/");
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable
              onPress={() => {
                router.back();
              }}
            >
              <ChevronLeft size={"$2"} />
            </Pressable>
          ),
          headerRight: () => {
            if (!form.formState.isDirty) return null;

            if (mutation.isPending) return <Spinner />;
            return (
              <Pressable
                onPress={form.handleSubmit((values) => {
                  mutation.mutate(values);
                })}
              >
                <SizableText
                  color={"$color11"}
                  fontFamily={"$mono"}
                  size={"$4"}
                  textAlign="center"
                >
                  Salvar
                </SizableText>
              </Pressable>
            );
          },
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.background.val,
          },
          headerTitleStyle: {
            color: theme.color.val,
          },
          title: "Editar nome",
        }}
      />
      <View bg={"$background"} f={1}>
        <View mx={defaultPadding}>
          <Form {...form}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChangeText={field.onChange}
                      placeholder="Nome"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </View>
      </View>
    </>
  );
}
