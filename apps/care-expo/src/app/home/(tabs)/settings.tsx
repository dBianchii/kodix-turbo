import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Tab() {
  return (
    <View className="flex h-full w-full flex-col bg-background p-8">
      <SafeAreaView className="flex bg-background">
        <Text className="text-2xl text-foreground">Settings page yaay</Text>
      </SafeAreaView>
    </View>
  );
}
