import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { api } from "~/utils/api";
import { useSignIn } from "~/utils/auth";
import { getBaseUrl } from "~/utils/base-url";

export default function Register() {
  const [email, setEmail] = useState("");

  const query = api.app.kodixCare.checkEmailForRegister.useQuery(
    {
      email,
    },
    {
      enabled: false,
    },
  );
  const router = useRouter();
  const utils = api.useUtils();
  const signIn = useSignIn();

  useEffect(() => {
    void utils.app.kodixCare.checkEmailForRegister.reset();
  }, [utils]);

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
              Seja bem-vindo(a)
            </Text>
            <Text className="text-center text-xl text-foreground">
              Se você já recebeu um convite para o KodixCare, digite seu email
              para continuar
            </Text>
          </View>
          <Input
            value={email}
            onChangeText={setEmail}
            label="Email"
            keyboardType="email-address"
            placeholder="Email"
            className="flex w-full"
            inputClasses="border-2 text-foreground"
            labelClasses="text-lg text-muted-foreground"
          />
          <Button
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
                // Navigate to the next step
                void signIn({
                  signInUrl: `${getBaseUrl()}/team/invite/${result.data.inviteId}`,
                });
              }
            }}
          />
          {!query.data && query.isError && (
            <Text className="mt-4 text-sm text-destructive">
              Ocorreu um erro ao verificar o email. Tente novamente.
            </Text>
          )}
          {query.data?.status === "not invited" && (
            <Text className="mt-4 text-sm text-destructive">
              Parece que você não possui um convite ainda. Peça um convite para
              um cuidador para continuar.
            </Text>
          )}
          {query.data?.status === "already registered" && (
            <Text className="mt-4 text-sm text-destructive">
              Email já cadastrado. Faça login para continuar.
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
