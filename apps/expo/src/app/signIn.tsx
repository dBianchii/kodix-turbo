import { useState } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ArrowLeft } from "lucide-react-native";

import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { useSignIn } from "~/utils/auth";
import { getBaseUrl } from "~/utils/base-url";

WebBrowser.maybeCompleteAuthSession();

//https://www.youtube.com/watch?v=ykQaIZtankk&ab_channel=OmatsolaDev
//https://www.youtube.com/watch?v=ykQaIZtankk&ab_channel=OmatsolaDev

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn, error, resetError } = useSignIn();

  const [userInfo, setUserInfo] = useState(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "42896229992-sbbdfg3cedm3sfsf5ahde8b06ud9ldu5.apps.googleusercontent.com",
    iosClientId:
      "42896229992-7k78j9qped4kbpcbghb8pkfbivop5g6c.apps.googleusercontent.com",
    webClientId:
      "42896229992-4ct0npg1074r199ilc5g3r6id6vsnocm.apps.googleusercontent.com",
    redirectUri: getBaseUrl() + "/auth/google/callback",
  });

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
  console.log(JSON.stringify(userInfo));

  return (
    <SafeAreaView className="bg-background">
      <View className="bg-background px-8">
        <Pressable
          className="mt-4"
          onPress={() => {
            router.back();
          }}
        >
          <ArrowLeft color={"white"} />
        </Pressable>
        <View className="mt-28 flex h-full items-center">
          <View className="pb-8">
            <Text className="text-center text-4xl font-bold text-primary">
              Bem vindo(a) de volta
            </Text>
          </View>
          <Button
            label="sign in with google"
            onPress={async () => {
              await promptAsync();
            }}
          />

          <Input
            label="Email"
            keyboardType="email-address"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            className="flex w-full"
            inputClasses="border-2 text-foreground"
            labelClasses="text-lg text-muted-foreground"
          />
          <Input
            label="Senha"
            keyboardType="default"
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            className="flex w-full"
            inputClasses="border-2 text-foreground"
            labelClasses="text-lg text-muted-foreground"
          />
          <Button
            className="mt-5 w-full items-center"
            label={"Continuar"}
            onPress={async () => {
              Keyboard.dismiss();
              await signIn({ email, password });
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
