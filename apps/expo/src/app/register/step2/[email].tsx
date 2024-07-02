import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { Input } from "~/components/Input";

export default function RegisterStep2() {
  const { email } = useLocalSearchParams();
  if (typeof email !== "string") {
    throw new Error("Invalid email");
  }

  const [password, setPassword] = useState("");

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
              Step2
            </Text>
            <Text className="text-center text-xl text-foreground">
              Se você já recebeu um convite para o KodixCare, digite seu email
              para continuar
            </Text>
          </View>
          <Input
            value={email}
            label="Email"
            keyboardType="email-address"
            placeholder="Email"
            readOnly
            className="flex w-full "
            inputClasses="border-2 text-foreground"
            labelClasses="text-lg text-muted-foreground"
          />
          <Input
            value={password}
            label="Senha"
            placeholder="********"
            readOnly
            className="flex w-full "
            inputClasses="border-2 text-foreground"
            labelClasses="text-lg text-muted-foreground"
          />
          {/* <Button
            disabled={!email || query.isFetching}
            className="mt-5 w-full items-center"
            label={
              query.isFetching ? (
                <ActivityIndicator color={"white"} />
              ) : (
                "Continuar"
              )
            }
            onPress={async () => {
              Keyboard.dismiss();
              const result = await query.refetch();
              if (result.data?.status === "invited") {
                //Navigate to the next step
                void router.push(`/register/step2/${email}`);
              }
            }}
          /> */}
        </View>
      </View>
    </SafeAreaView>
  );
}
