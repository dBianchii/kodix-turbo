import { config } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";

// import { palettes, templates, themes } from "./tamagui-config/themes-gist";

export const tamaguiConfig = createTamagui({
  ...config,
  // palettes,
  // templates,
  // themes,
});
export default tamaguiConfig;
export type Conf = typeof tamaguiConfig;
declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

declare module "@tamagui/toast" {
  interface CustomData {
    variant: "error" | "default";
  }
}
