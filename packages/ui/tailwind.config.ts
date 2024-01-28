import type { Config } from "tailwindcss";

import baseConfig from "@kdx/tailwind-config/web";

export default {
  content: ["./src/**/*.tsx"],
  presets: [baseConfig],
} satisfies Config;
