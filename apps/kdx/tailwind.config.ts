import type { Config } from "tailwindcss";

import baseConfig from "@kdx/tailwind-config/web";

export default {
  content: [...baseConfig.content, "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;
