import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "~/components/Button";
import { useSignOut } from "~/utils/auth";

export default function ProfilePage() {
  const signOut = useSignOut();
  return (
    <View className="flex h-full w-full flex-col bg-background p-8">
      <SafeAreaView className="flex bg-background">
        <Text className="text-2xl text-foreground">Profile Page</Text>
        <Button
          className="rounded-full"
          label="Sign out"
          onPress={() => signOut()}
        />
      </SafeAreaView>
    </View>
  );
}
