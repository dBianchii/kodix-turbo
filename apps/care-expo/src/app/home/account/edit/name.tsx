import { Pressable } from "react-native";
import { router, Stack } from "expo-router";
import { ArrowLeft, ChevronLeft } from "@tamagui/lucide-icons";
import { H1, H4, Input, SizableText, Text, View, XStack } from "tamagui";

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
import { RootSafeAreaView } from "~/components/safe-area-view";

export default function EditNamePage() {
  const form = useForm({
    schema: ZChangeNameInputSchema,
  });

  return (
    <RootSafeAreaView>
      <Stack.Screen
        options={{
          title: "Edit Name",

          header: (props) => {
            return (
              <View
                h={"$9"}
                jc={"flex-end"}
                bg={"$background"}
                borderColor={"$backgroundHover"}
                borderBottomWidth={"1px"}
              >
                <XStack mx={"$4"} ai={"center"} mb={"$2"}>
                  <Pressable
                    onPress={() => {
                      router.back();
                    }}
                  >
                    <ChevronLeft size={"$2"} />
                  </Pressable>
                  <SizableText
                    size={"$6"}
                    fontFamily={"$mono"}
                    textAlign="center"
                    alignSelf="center"
                    mx={"auto"}
                  >
                    {props.options.title}
                  </SizableText>
                  <Pressable>
                    <SizableText
                      size={"$4"}
                      fontFamily={"$mono"}
                      textAlign="center"
                      color={"$color11"}
                    >
                      Salvar
                    </SizableText>
                  </Pressable>
                </XStack>
              </View>
            );
          },
          headerBackTitleStyle: {},
          navigationBarHidden: true,
        }}
      />
      <Form {...form}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem bg={"red"}>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Nome"
                  onChangeText={field.onChange}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    </RootSafeAreaView>
  );
}
