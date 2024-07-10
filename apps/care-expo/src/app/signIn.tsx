import { Keyboard, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { Button, H1, Input, Spinner, Text, View, YStack } from "tamagui";

import { getErrorMessage } from "@kdx/shared";
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
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  //       setUserInfo(JSON.parse(userJSON));
  //     } else if (response?.type === "success") {
  //       // If no user information is found and the response type is "success" (assuming response is defined),
  //       // call getUserInfo with the access token from the response
  //       // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [response]);

  //log the userInfo to see user details
  //console.log(JSON.stringify(userInfo));
  const form = useForm({
    schema: ZSignInByPasswordInputSchema,
  });
  return (
    <YStack bg={"$background"} flex={1} alignItems="center" px={"$3"}>
      <SafeAreaView>
        <View>
          <Pressable
            onPress={() => {
              router.back();
            }}
          >
            <ArrowLeft color={"white"} />
          </Pressable>
          <View>
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
                        placeholder="name@email.com"
                        onChangeText={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        secureTextEntry
                        onChangeText={field.onChange}
                        value={field.value}
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
        </View>
      </SafeAreaView>
    </YStack>
  );
}
