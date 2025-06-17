"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export function WelcomeHeader() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600">
        <Sparkles className="h-8 w-8 text-white" />
      </div>

      <h1 className="mb-3 text-3xl font-bold tracking-tight">
        {t("apps.chat.welcome-chat")}
      </h1>

      <p className="text-muted-foreground max-w-md text-lg">
        {t("apps.chat.messages.greeting")}
      </p>
    </div>
  );
}
