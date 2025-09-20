import { Appearance, useColorScheme } from "react-native";
import { Moon, Sun } from "@tamagui/lucide-icons";
import { Button } from "tamagui";

export function ToggleThemeButton() {
  const colorScheme = useColorScheme();
  return (
    <Button
      onPress={() => {
        Appearance.setColorScheme(colorScheme === "dark" ? "light" : "dark");
      }}
    >
      {colorScheme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
