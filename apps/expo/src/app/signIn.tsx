import { useState } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { api } from "~/utils/api";
import { useSignIn } from "~/utils/auth";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn, error, resetError } = useSignIn();

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
