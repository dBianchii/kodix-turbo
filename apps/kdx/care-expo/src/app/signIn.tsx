import { Keyboard, TouchableOpacity } from "react-native";
import { getErrorMessage } from "@kodix/shared/utils";
import { Button } from "@tamagui/button";
import { Text, useTheme, View } from "@tamagui/core";
import { Input } from "@tamagui/input";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { YStack } from "@tamagui/stacks";
import { H1 } from "@tamagui/text";
import { router, Stack } from "expo-router";

import { ZSignInByPasswordInputSchema } from "@kdx/validators/trpc/user";

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
import { useSignIn } from "~/utils/auth";

//https://www.youtube.com/watch?v=ykQaIZtankk&ab_channel=OmatsolaDev
//https://www.youtube.com/watch?v=ykQaIZtankk&ab_channel=OmatsolaDev

export default function SignIn() {
  const mutation = useSignIn();

  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   androidClientId:
  //     "42896229992-sbbdfg3cedm3sfsf5ahde8b06ud9ldu5.apps.googleusercontent.com",
  //   iosClientId:
  //     "42896229992-7k78j9qped4kbpcbghb8pkfbivop5g6c.apps.googleusercontent.com",
  //   webClientId:
  //     "42896229992-4ct0npg1074r199ilc5g3r6id6vsnocm.apps.googleusercontent.com",
  //   redirectUri: getBaseUrl() + "/auth/google/callback",
  // });

  // const getUserInfo = async (token: string) => {
  //   //absent token
  //   if (!token) return;
  //   //present token
  //   try {
  //     const response = await fetch(
  //       "https://www.googleapis.com/userinfo/v2/me",
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       },
  //     );

  //     const user = await response.json();
  //     //store user information  in Asyncstorage
  //     await AsyncStorage.setItem("user", JSON.stringify(user));
  //     setUserInfo(user);
  //   } catch (error) {
  //     console.error(
  //       "Failed to fetch user data:",
  //       response.status,
  //       response.statusText,
  //     );
  //   }
  // };

  // const signInWithGoogle = async () => {
  //   try {
  //     // Attempt to retrieve user information from AsyncStorage
  //     const userJSON = await AsyncStorage.getItem("user");

  //     if (userJSON) {
  //       // If user information is found in AsyncStorage, parse it and set it in the state

  //       setUserInfo(JSON.parse(userJSON));
  //     } else if (response?.type === "success") {
  //       // If no user information is found and the response type is "success" (assuming response is defined),
  //       // call getUserInfo with the access token from the response

  //       void getUserInfo(response.authentication!.accessToken);
  //     }
  //   } catch (error) {
  //     // Handle any errors that occur during AsyncStorage retrieval or other operations
  //     console.error("Error retrieving user data from AsyncStorage:", error);
  //   }
  // };

  // //add it to a useEffect with response as a dependency
  // useEffect(() => {
  //   void signInWithGoogle();
  // }, [response]);

  //log the userInfo to see user details
  //console.log(JSON.stringify(userInfo));
  const form = useForm({
    schema: ZSignInByPasswordInputSchema,
  });

  const theme = useTheme();

  return (
    <YStack alignItems="center" bg={"$background"} flex={1} px={"$3"}>
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
      <View mt={"$2"}>
        <View>
          <H1>Bem vindo(a) de volta</H1>
        </View>
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
                    keyboardType="email-address"
                    onChangeText={field.onChange}
                    placeholder="name@email.com"
                    value={field.value}
                  />
                </FormControl>
                <FormDescription>
                  Este é o seu nome de exibição público.
                </FormDescription>
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
                    onChangeText={field.onChange}
                    secureTextEntry
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            mt={"$6"}
            onPress={form.handleSubmit((values) => {
              Keyboard.dismiss();
              void mutation.mutate(values);
            })}
          >
            {mutation.isPending ? <Spinner /> : "Continuar"}
          </Button>
        </Form>

        {mutation.isError && (
          <View>
            <Text>{getErrorMessage(mutation.error)}</Text>
          </View>
        )}
      </View>
    </YStack>
  );
}
