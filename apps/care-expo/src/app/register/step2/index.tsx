import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { api } from "~/utils/api";
import { setToken } from "~/utils/session-store";

export default function RegisterStep2() {
  const { email, inviteId } = useLocalSearchParams();
  if (typeof email !== "string" || typeof inviteId !== "string")
    throw new Error("Invalid email or inviteId");

  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const utils = api.useUtils();

  const mutation = api.user.signupWithPassword.useMutation({
    onSuccess: async (sessionToken) => {
      setToken(sessionToken);
      await utils.invalidate();
      router.replace("/");
    },
  });

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
        <View className="flex h-full items-center">
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
            label="Nome"
            value={name}
            onChangeText={setName}
            placeholder="joan doe"
            className="flex w-full "
            inputClasses="border-2 text-foreground"
            labelClasses="text-lg text-muted-foreground"
          />
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
            onChangeText={setPassword}
            label="Senha"
            placeholder="********"
            className="flex w-full"
            secureTextEntry
            inputClasses="border-2 text-foreground"
            labelClasses="text-lg text-muted-foreground"
          />
          <Button
            disabled={!email || mutation.isPending || !password || !name}
            className="mt-5 w-full items-center"
            label={
              mutation.isPending ? (
                <ActivityIndicator color={"white"} />
              ) : (
                "Continuar"
              )
            }
            onPress={() => {
              mutation.mutate({
                email,
                password,
                name,
                invite: inviteId,
              });
            }}
          />
        </View>
        {mutation.error && (
          <Text className="text-destructive">{mutation.error.message}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
