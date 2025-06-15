import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@kdx/ui/card";

import { ChatV3Container } from "./_components/chat-v3-container";

export default function ChatV3Page() {
  return (
    <div className="h-[calc(100dvh-55px)]">
      <Suspense
        fallback={
          <Card className="flex h-full items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Carregando Chat V3...</span>
            </div>
          </Card>
        }
      >
        <ChatV3Container />
      </Suspense>
    </div>
  );
}
