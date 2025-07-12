"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { ThemeProvider, useTheme } from "next-themes";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const t = useTranslations();

  // ✅ HYDRATION FIX: Use mounted state from next-themes
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ HYDRATION FIX: Render same structure on server and client
  // Show neutral state until hydrated
  const showDarkIcon =
    mounted && (theme === "dark" || resolvedTheme === "dark");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" suppressHydrationWarning>
          <Sun
            className={`size-5 transition-all ${showDarkIcon ? "scale-0 -rotate-90" : "scale-100 rotate-0"}`}
            aria-hidden="true"
          />
          <Moon
            className={`absolute size-5 transition-all ${showDarkIcon ? "scale-100 rotate-0" : "scale-0 rotate-90"}`}
            aria-hidden="true"
          />
          <span className="sr-only">{t("Toggle theme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {t("Light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {t("Dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          {t("System")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ThemeProvider, ThemeToggle };
