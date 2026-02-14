import { Appearance, useColorScheme } from "react-native";
import { Button } from "@tamagui/button";
import { Moon, Sun } from "@tamagui/lucide-icons";

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
